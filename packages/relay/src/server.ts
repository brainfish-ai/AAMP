/**
 * AAMP Relay HTTP server (Fastify).
 *
 * Endpoints:
 *
 *   POST   /mailbox/:agentId/send          Agent deposits a task/message.
 *   GET    /mailbox/notifications           SSE stream — agent receives messages.
 *   PATCH  /status                         Heartbeat / task status update.
 *   POST   /inbound                        Receives messages from OTHER relays (federation).
 *   GET    /agents                         List registered agents.
 *   GET    /agents/:agentId                Get agent card.
 *   GET    /agents/:agentId/did.json       Serve DID Document (for did:web resolution).
 *   POST   /agents/register                Register an agent with this relay.
 *   GET    /health                         Health check.
 *
 * Connection model:
 *   - Intra-company: Agents connect via NATS WebSocket (outbound only from sandbox).
 *   - Inter-company: Relay A → Relay B via HTTPS POST /inbound.
 *   - Agents with no NATS client: Use SSE (GET /mailbox/notifications) + HTTP POST.
 */

import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { v7 as uuidv7 } from "uuid";
import {
  type Envelope,
  type AgentCard,
  MessageType,
  TaskStatus,
  RoutingMode,
  AAMP_VERSION,
} from "@aamp/core";
import { DIDResolver, verifyEnvelope, publicKeyToMultibase } from "@aamp/identity";
import type { RelayConfig } from "./config.js";
import type { NatsContext } from "./nats.js";
import { publishToMailbox, agentIdFromDid, ensureAgentConsumer, drainAgentMailbox } from "./nats.js";
import { FederationRouter } from "./federation.js";
import { AgentRegistry } from "./registry.js";

// SSE connection map: agentId → response writer
type SseClients = Map<string, FastifyReply[]>;

export async function buildServer(config: RelayConfig, nats: NatsContext) {
  const fastify = Fastify({ logger: { level: "info" } });

  await fastify.register(cors, { origin: true });

  const resolver  = new DIDResolver();
  const federation = new FederationRouter(resolver);
  const registry  = new AgentRegistry();
  const sseClients: SseClients = new Map();

  // ─────────────────────────────────────────────────────────────
  //  Health check
  // ─────────────────────────────────────────────────────────────

  fastify.get("/health", async () => ({
    status:      "ok",
    aampVersion: AAMP_VERSION,
    domain:      config.domain,
    uptime:      process.uptime(),
    timestamp:   Date.now(),
  }));

  // ─────────────────────────────────────────────────────────────
  //  DID Document pre-registration (dev / federation bootstrap)
  //  Allows external relays or test harnesses to register a remote
  //  agent's DID Document so this relay can resolve it for routing.
  //  In production, did:web resolution uses real DNS instead.
  // ─────────────────────────────────────────────────────────────

  fastify.post<{ Body: { did: string; document: Record<string, unknown> } }>(
    "/resolver/register",
    async (req, reply) => {
      const { did, document } = req.body;
      if (!did || !document) return reply.code(400).send({ error: "did and document required" });
      resolver.register(did, document as unknown as Parameters<typeof resolver.register>[1]);
      console.log(`[relay] Registered DID Document for ${did}`);
      return reply.code(201).send({ did, registered: true });
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  Agent registration
  // ─────────────────────────────────────────────────────────────

  fastify.post<{ Body: { agentId: string; card: AgentCard; publicKey: string } }>(
    "/agents/register",
    async (req, reply) => {
      const { agentId, card } = req.body;
      if (!agentId || !card) return reply.code(400).send({ error: "agentId and card required" });

      // Build a DID Document from the Agent Card's public key and cache it in
      // the local resolver so signature verification doesn't need an outbound
      // HTTP fetch for DID documents — critical for local/private domains.
      // Build a DID Document from the Agent Card's public key, cache it in the
      // resolver (avoids outbound HTTP fetches for local domains), and store it
      // in the registry so GET /agents/:agentId works.
      let didDocument: Parameters<typeof registry.registerWithDocument>[2] = {
        "@context":         ["https://www.w3.org/ns/did/v1"],
        id:                 card.did,
        verificationMethod: [],
        authentication:     [],
        assertionMethod:    [],
        service:            [],
      };

      if (card.publicKey) {
        try {
          const pubKeyBytes = new Uint8Array(Buffer.from(card.publicKey as string, "base64"));
          const multibase   = publicKeyToMultibase(pubKeyBytes);
          const keyId       = `${card.did}#key-1`;
          didDocument = {
            "@context":          ["https://www.w3.org/ns/did/v1"],
            id:                  card.did,
            verificationMethod:  [{ id: keyId, type: "Ed25519VerificationKey2020", controller: card.did, publicKeyMultibase: multibase }],
            authentication:      [keyId],
            assertionMethod:     [keyId],
            service:             [],
          };
          resolver.register(card.did, didDocument);
        } catch (e) {
          console.warn(`[relay] Could not cache DID doc for ${card.did}:`, e);
        }
      }

      // Add to agent registry (makes GET /agents and GET /agents/:agentId work)
      registry.registerWithDocument(agentId, card, didDocument);

      await ensureAgentConsumer(nats.jsm, config, agentId);

      // Start delivering queued NATS messages to this agent via SSE if connected
      subscribeNatsToSse(nats, config, agentId, sseClients);

      console.log(`[relay] Agent registered: ${agentId} (${card.did})`);
      return reply.code(201).send({ agentId, did: card.did, mailboxSubject: `aamp.${config.domain}.${agentId}.inbox` });
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  Agent directory
  // ─────────────────────────────────────────────────────────────

  fastify.get("/agents", async () => registry.list());

  fastify.get<{ Params: { agentId: string } }>("/agents/:agentId", async (req, reply) => {
    const reg = registry.get(req.params.agentId);
    if (!reg) return reply.code(404).send({ error: "Agent not found" });
    return reg.card;
  });

  fastify.get<{ Params: { agentId: string } }>(
    "/agents/:agentId/did.json",
    async (req, reply) => {
      const reg = registry.get(req.params.agentId);
      if (!reg) return reply.code(404).send({ error: "Agent not found" });
      return reply
        .header("Content-Type", "application/did+json")
        .send(reg.didDocument);
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  GET /mailbox/:agentId/poll — pull pending messages from JetStream
  //  Allows browser clients to poll for missed messages (SSE fallback).
  // ─────────────────────────────────────────────────────────────

  fastify.get<{ Params: { agentId: string } }>(
    "/mailbox/:agentId/poll",
    async (req, reply) => {
      const { agentId } = req.params;
      const messages = await drainAgentMailbox(nats.js, config, agentId);
      const envelopes = messages
        .map(raw => { try { return JSON.parse(raw); } catch { return null; } })
        .filter(Boolean);
      return reply.send({ messages: envelopes });
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  POST /mailbox/:agentId/send — agent deposits a message
  // ─────────────────────────────────────────────────────────────

  fastify.post<{ Params: { agentId: string }; Body: Envelope }>(
    "/mailbox/:agentId/send",
    async (req, reply) => {
      const envelope: Envelope = {
        ...req.body,
        aampVersion: AAMP_VERSION,
        createdAt:   req.body.createdAt ?? Date.now(),
        messageId:   req.body.messageId ?? uuidv7(),
      };

      // Verify signature if present (hard-reject only when RELAY_STRICT_AUTH=true)
      if (envelope.signature) {
        try {
          const valid = await verifyEnvelope(envelope, resolver);
          if (!valid && process.env.RELAY_STRICT_AUTH === "true") {
            return reply.code(401).send({ error: "Invalid envelope signature" });
          }
          if (!valid) console.warn(`[relay] Signature invalid for ${envelope.messageId} from ${envelope.senderDid} — passing (strict auth disabled)`);
        } catch (err) {
          if (process.env.RELAY_STRICT_AUTH === "true") {
            return reply.code(401).send({ error: `Signature verification failed: ${String(err)}` });
          }
          console.warn(`[relay] Signature verification error for ${envelope.messageId}: ${String(err)} — passing`);
        }
      }

      // Check TTL
      if (envelope.ttlMs && envelope.ttlMs > 0) {
        if (Date.now() > envelope.createdAt + envelope.ttlMs) {
          return reply.code(410).send({ error: "Message TTL expired" });
        }
      }

      await routeEnvelope(envelope, config, nats, federation, sseClients, registry);

      return reply.code(202).send({
        messageId: envelope.messageId,
        taskId:    envelope.taskId,
        status:    "queued",
      });
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  GET /mailbox/notifications — SSE stream for incoming messages
  // ─────────────────────────────────────────────────────────────

  fastify.get<{ Querystring: { agentId: string } }>(
    "/mailbox/notifications",
    async (req, reply) => {
      const { agentId } = req.query;
      if (!agentId) return reply.code(400).send({ error: "agentId query param required" });

      reply.raw.writeHead(200, {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
        "X-Accel-Buffering": "no",
      });

      // Send initial keep-alive
      reply.raw.write("event: connected\ndata: {}\n\n");

      // Register this SSE client
      if (!sseClients.has(agentId)) sseClients.set(agentId, []);
      sseClients.get(agentId)!.push(reply);

      req.raw.on("close", () => {
        const clients = sseClients.get(agentId) ?? [];
        const idx = clients.indexOf(reply);
        if (idx !== -1) {
          clients.splice(idx, 1);
          console.log(`[relay/sse] client disconnected for ${agentId}, remaining: ${clients.length}`);
        }
      });

      // Keep connection alive with a heartbeat every 15 seconds
      const heartbeat = setInterval(() => {
        reply.raw.write(": heartbeat\n\n");
      }, 15_000);

      req.raw.on("close", () => clearInterval(heartbeat));

      // Drain any messages that arrived while this SSE was disconnected.
      // This replays missed envelopes from the JetStream durable consumer.
      drainAgentMailbox(nats.js, config, agentId).then(msgs => {
        for (const raw of msgs) {
          try {
            const env = JSON.parse(raw) as Record<string, unknown>;
            console.log(`[relay/sse] replaying missed message for ${agentId}: type=${env.messageType}`);
            reply.raw.write(`event: message\ndata: ${raw}\n\n`);
          } catch { /* malformed */ }
        }
      }).catch(() => { /* non-fatal */ });

      // Do not call reply.send() — SSE stays open
      await new Promise(() => {});
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  PATCH /status — heartbeat / task status update
  // ─────────────────────────────────────────────────────────────

  fastify.patch<{ Body: { agentId: string; taskId: string; status: TaskStatus; message?: string } }>(
    "/status",
    async (req, reply) => {
      const { agentId, taskId, status, message } = req.body;
      if (!agentId || !taskId || !status) {
        return reply.code(400).send({ error: "agentId, taskId, and status required" });
      }

      registry.touch(agentId);

      // Broadcast status update to any SSE listeners watching the task
      const statusEnvelope: Partial<Envelope> = {
        messageId:   uuidv7(),
        messageType: MessageType.STATUS,
        taskId,
        status:      status as TaskStatus,
        metadata:    message ? { message } : undefined,
        createdAt:   Date.now(),
        aampVersion: AAMP_VERSION,
      };

      broadcastToSse(sseClients, agentId, statusEnvelope);

      return reply.send({ ok: true, taskId, status });
    },
  );

  // ─────────────────────────────────────────────────────────────
  //  POST /inbound — receive messages from OTHER relays
  //  This is the inter-relay federation endpoint (the "SMTP relay" port)
  // ─────────────────────────────────────────────────────────────

  fastify.post<{ Body: Envelope }>("/inbound", async (req, reply) => {
    const envelope = req.body;

    if (!envelope.messageId || !envelope.senderDid || !envelope.recipientDid) {
      return reply.code(400).send({ error: "Invalid envelope: missing required fields" });
    }

    // Verify signature from sending relay's agent (warn-only in dev)
    if (envelope.signature) {
      try {
        const valid = await verifyEnvelope(envelope, resolver);
        if (!valid) console.warn(`[relay/inbound] Signature invalid from ${envelope.senderDid} — passing`);
      } catch (err) {
        console.warn(`[relay/inbound] Signature verification error from ${envelope.senderDid}: ${String(err)} — passing`);
      }
    }

    // Route to local agent.
    // Prefer the registry so `did:key:…` DIDs map to their user-friendly agentId
    // (e.g. "finance-bot-ui") rather than the key-truncation fallback.
    const reg = registry.get(envelope.recipientDid);
    const localAgentId = reg?.agentId ?? agentIdFromDid(envelope.recipientDid, config.domain);
    if (!localAgentId) {
      return reply.code(404).send({
        error: `Recipient DID ${envelope.recipientDid} is not local to this relay (domain: ${config.domain})`,
      });
    }

    await deliverToAgent(envelope, localAgentId, config, nats, sseClients);
    registry.touch(localAgentId);
    console.log(`[relay] Inbound message ${envelope.messageId} delivered to ${localAgentId}`);
    return reply.code(202).send({ messageId: envelope.messageId, status: "delivered" });
  });

  return fastify;
}

// ─────────────────────────────────────────────────────────────
//  Internal routing logic
// ─────────────────────────────────────────────────────────────

async function routeEnvelope(
  envelope: Envelope,
  config: RelayConfig,
  nats: NatsContext,
  federation: FederationRouter,
  sseClients: SseClients,
  registry: import("./registry.js").AgentRegistry,
): Promise<void> {
  // Priority 1: If replyToMailbox is a NATS subject for THIS relay's domain, publish directly.
  // Only use direct NATS for local subjects — cross-relay subjects fall through to DID routing
  // so the response travels via HTTP /inbound (which also writes to JetStream for durability).
  const isReplyType = envelope.messageType === MessageType.RESPONSE ||
                      envelope.messageType === MessageType.PROBE_RESPONSE ||
                      envelope.messageType === MessageType.STATUS ||
                      envelope.messageType === MessageType.CONFIRM ||
                      envelope.messageType === MessageType.CANCEL;
  const localMailboxPrefix = `aamp.${config.domain}.`;
  if (envelope.replyToMailbox?.startsWith(localMailboxPrefix) && isReplyType) {
    const subject = envelope.replyToMailbox;
    const payload = new TextEncoder().encode(JSON.stringify(envelope));
    try {
      nats.nc.publish(subject, payload);
      console.log(`[relay] Delivered ${envelope.messageId} via replyToMailbox NATS subject ${subject}`);
      return;
    } catch (err) {
      console.warn(`[relay] replyToMailbox NATS delivery failed, falling back to DID routing:`, err);
    }
  }

  // Priority 2: Check if recipient is registered locally in THIS relay's registry.
  const localReg = registry.get(envelope.recipientDid);
  if (localReg) {
    await deliverToAgent(envelope, localReg.agentId, config, nats, sseClients);
    return;
  }

  // Priority 3: did:web DID matching this relay's domain → local delivery.
  if (envelope.recipientDid.startsWith(`did:web:${config.domain}`)) {
    const agentId = agentIdFromDid(envelope.recipientDid, config.domain);
    if (!agentId) throw new Error(`Cannot resolve local agentId from ${envelope.recipientDid}`);
    await deliverToAgent(envelope, agentId, config, nats, sseClients);
    return;
  }

  // Priority 4: Cross-domain federation — resolve DID → forward to remote relay.
  console.log(`[relay] Federating message ${envelope.messageId} to ${envelope.recipientDid}`);
  const result = await federation.forwardToRemoteRelay(envelope);
  if (!result.success) {
    throw new Error(`Federation failed: ${result.error}`);
  }
  console.log(`[relay] Forwarded to ${result.relayUrl}`);
}

async function deliverToAgent(
  envelope: Envelope,
  agentId: string,
  config: RelayConfig,
  nats: NatsContext,
  sseClients: SseClients,
): Promise<void> {
  const payload = new TextEncoder().encode(JSON.stringify(envelope));
  const subject  = `aamp.${config.domain}.${agentId}.inbox`;

  // Publish on core NATS — immediately received by any agent subscribed to this subject
  // (both NATS-connected SDK agents and the SSE bridge subscription)
  try {
    nats.nc.publish(subject, payload);
    console.log(`[relay] Delivered ${envelope.messageId} to ${agentId} via NATS (${subject})`);
  } catch (err) {
    console.warn(`[relay] NATS publish failed for ${agentId}, falling back to SSE:`, err);
    broadcastToSse(sseClients, agentId, envelope);
    return;
  }

  // Also persist to JetStream for durability (offline agents, replay)
  try {
    await publishToMailbox(nats.js, config.domain, agentId, payload, envelope.messageId);
  } catch {
    // JetStream consumer may not exist yet — durability is best-effort in v0.1
  }
}

function broadcastToSse(sseClients: SseClients, agentId: string, data: unknown): void {
  const clients = sseClients.get(agentId) ?? [];
  const payload = `event: message\ndata: ${JSON.stringify(data)}\n\n`;
  console.log(`[relay/sse] broadcast to ${agentId}: ${clients.length} client(s), type=${(data as Record<string,unknown>)?.messageType}`);
  let sent = 0;
  for (const client of clients) {
    try {
      client.raw.write(payload);
      sent++;
    } catch {
      // Client disconnected
    }
  }
  if (sent === 0 && clients.length > 0) {
    console.warn(`[relay/sse] all ${clients.length} client(s) for ${agentId} appear disconnected`);
  }
}

/**
 * Subscribe to NATS messages for an agent and bridge them to SSE clients.
 */
function subscribeNatsToSse(
  nats: NatsContext,
  config: RelayConfig,
  agentId: string,
  sseClients: SseClients,
): void {
  const subject = `aamp.${config.domain}.${agentId}.inbox`;
  console.log(`[relay/sse] subscribing NATS→SSE for ${agentId} on ${subject}`);

  // Subscribe to NATS core (non-persistent) for real-time bridging
  const sub = nats.nc.subscribe(subject);
  (async () => {
    for await (const msg of sub) {
      const payload = new TextDecoder().decode(msg.data);
      try {
        const envelope = JSON.parse(payload) as Record<string, unknown>;
        console.log(`[relay/sse] NATS→SSE received for ${agentId}: type=${envelope.messageType} taskId=${envelope.taskId}`);
        broadcastToSse(sseClients, agentId, envelope);
      } catch {
        // Malformed message
      }
    }
  })().catch(console.error);
}
