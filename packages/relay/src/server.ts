/**
 * AAMP Relay HTTP server (Hono — Cloudflare Workers).
 *
 * Endpoints:
 *   POST   /mailbox/:agentId/send          Agent deposits a task/message.
 *   GET    /mailbox/:agentId/poll          Pull pending messages from JetStream.
 *   GET    /mailbox/notifications          SSE stream — agent receives messages.
 *   PATCH  /status                         Heartbeat / task status update.
 *   POST   /inbound                        Receives messages from OTHER relays (federation).
 *   GET    /agents                         List registered agents.
 *   GET    /agents/:agentId                Get agent card.
 *   GET    /agents/:agentId/did.json       Serve DID Document (for did:web resolution).
 *   POST   /agents/register                Register an agent with this relay.
 *   POST   /resolver/register              Pre-register a remote DID Document.
 *   GET    /health                         Health check.
 *
 * SSE model (Workers edition):
 *   Each SSE connection subscribes directly to the agent's NATS subject.
 *   NATS pub/sub handles fanout — no in-memory client map needed.
 */

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import {
  type Envelope,
  type AgentCard,
  MessageType,
  TaskStatus,
  AAMP_VERSION,
} from "@aamp/core";
import { DIDResolver, verifyEnvelope, publicKeyToMultibase } from "@aamp/identity";
import type { RelayConfig, WorkerEnv } from "./config.js";
import type { NatsContext } from "./nats.js";
import { publishToMailbox, agentIdFromDid, ensureAgentConsumer, drainAgentMailbox } from "./nats.js";
import { FederationRouter } from "./federation.js";
import { AgentRegistry } from "./registry.js";

/** Stable module-level start time for uptime reporting */
const START_TIME = Date.now();

/** Shared DID resolver — in-memory cache, lives for the Worker instance lifetime */
let sharedResolver: DIDResolver | null = null;
function getResolver(): DIDResolver {
  if (!sharedResolver) sharedResolver = new DIDResolver();
  return sharedResolver;
}

/** UUIDv4 from Web Crypto (available in both Workers and Node.js 18+) */
function uuid(): string {
  return crypto.randomUUID();
}

export function buildApp(
  config: RelayConfig,
  nats: NatsContext,
  kv: KVNamespace,
): Hono<{ Bindings: WorkerEnv }> {
  const app       = new Hono<{ Bindings: WorkerEnv }>();
  const registry  = new AgentRegistry(kv);
  const resolver  = getResolver();
  const federation = new FederationRouter(resolver);

  app.use("*", cors({ origin: "*" }));

  // ─────────────────────────────────────────────────────────────
  //  Health check
  // ─────────────────────────────────────────────────────────────

  app.get("/health", c =>
    c.json({
      status:      "ok",
      aampVersion: AAMP_VERSION,
      domain:      config.domain,
      uptime:      Math.floor((Date.now() - START_TIME) / 1000),
      timestamp:   Date.now(),
    }),
  );

  // ─────────────────────────────────────────────────────────────
  //  DID Document pre-registration
  // ─────────────────────────────────────────────────────────────

  app.post("/resolver/register", async c => {
    const { did, document } = await c.req.json<{ did: string; document: Record<string, unknown> }>();
    if (!did || !document) return c.json({ error: "did and document required" }, 400);
    resolver.register(did, document as unknown as Parameters<typeof resolver.register>[1]);
    console.log(`[relay] Registered DID Document for ${did}`);
    return c.json({ did, registered: true }, 201);
  });

  // ─────────────────────────────────────────────────────────────
  //  Agent registration
  // ─────────────────────────────────────────────────────────────

  app.post("/agents/register", async c => {
    const { agentId, card } = await c.req.json<{ agentId: string; card: AgentCard; publicKey?: string }>();
    if (!agentId || !card) return c.json({ error: "agentId and card required" }, 400);

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
        const pubKeyBytes = new Uint8Array(
          Array.from(atob(card.publicKey as string), ch => ch.charCodeAt(0)),
        );
        const multibase = publicKeyToMultibase(pubKeyBytes);
        const keyId     = `${card.did}#key-1`;
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

    await registry.registerWithDocument(agentId, card, didDocument);
    await ensureAgentConsumer(nats.jsm, config, agentId);

    console.log(`[relay] Agent registered: ${agentId} (${card.did})`);
    return c.json({
      agentId,
      did:           card.did,
      mailboxSubject: `aamp.${config.domain}.${agentId}.inbox`,
    }, 201);
  });

  // ─────────────────────────────────────────────────────────────
  //  Agent directory
  // ─────────────────────────────────────────────────────────────

  app.get("/agents", async c => c.json(await registry.list()));

  app.get("/agents/:agentId", async c => {
    const reg = await registry.get(c.req.param("agentId"));
    if (!reg) return c.json({ error: "Agent not found" }, 404);
    return c.json(reg.card);
  });

  app.get("/agents/:agentId/did.json", async c => {
    const reg = await registry.get(c.req.param("agentId"));
    if (!reg) return c.json({ error: "Agent not found" }, 404);
    return new Response(JSON.stringify(reg.didDocument), {
      headers: { "Content-Type": "application/did+json" },
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  GET /mailbox/:agentId/poll — pull pending messages
  // ─────────────────────────────────────────────────────────────

  app.get("/mailbox/:agentId/poll", async c => {
    const { agentId } = c.req.param();
    const messages    = await drainAgentMailbox(nats.js, config, agentId);
    const envelopes   = messages
      .map(raw => { try { return JSON.parse(raw); } catch { return null; } })
      .filter(Boolean);
    return c.json({ messages: envelopes });
  });

  // ─────────────────────────────────────────────────────────────
  //  POST /mailbox/:agentId/send — agent deposits a message
  // ─────────────────────────────────────────────────────────────

  app.post("/mailbox/:agentId/send", async c => {
    const body: Envelope = await c.req.json();
    const envelope: Envelope = {
      ...body,
      aampVersion: AAMP_VERSION,
      createdAt:   body.createdAt ?? Date.now(),
      messageId:   body.messageId ?? uuid(),
    };

    if (envelope.signature) {
      try {
        const valid = await verifyEnvelope(envelope, resolver);
        if (!valid && config.strictAuth) {
          return c.json({ error: "Invalid envelope signature" }, 401);
        }
        if (!valid) console.warn(`[relay] Signature invalid for ${envelope.messageId} — passing (strict auth disabled)`);
      } catch (err) {
        if (config.strictAuth) {
          return c.json({ error: `Signature verification failed: ${String(err)}` }, 401);
        }
        console.warn(`[relay] Signature verification error for ${envelope.messageId}: ${String(err)} — passing`);
      }
    }

    if (envelope.ttlMs && envelope.ttlMs > 0) {
      if (Date.now() > envelope.createdAt + envelope.ttlMs) {
        return c.json({ error: "Message TTL expired" }, 410);
      }
    }

    await routeEnvelope(envelope, config, nats, federation, registry);

    return c.json({ messageId: envelope.messageId, taskId: envelope.taskId, status: "queued" }, 202);
  });

  // ─────────────────────────────────────────────────────────────
  //  GET /mailbox/notifications — SSE stream
  //
  //  Each connection subscribes to NATS directly. NATS pub/sub
  //  handles fanout — no in-memory client map required.
  // ─────────────────────────────────────────────────────────────

  app.get("/mailbox/notifications", c => {
    const agentId = c.req.query("agentId");
    if (!agentId) return c.json({ error: "agentId query param required" }, 400);

    const subject = `aamp.${config.domain}.${agentId}.inbox`;

    return streamSSE(c, async stream => {
      // Subscribe to the agent's NATS inbox before sending anything,
      // to avoid race conditions where a message arrives between drain and subscribe.
      const sub = nats.nc.subscribe(subject);

      stream.onAbort(async () => {
        sub.unsubscribe();
      });

      // Send initial connected event
      await stream.writeSSE({ event: "connected", data: "{}" });

      // Replay any messages that arrived while this SSE was disconnected
      const pending = await drainAgentMailbox(nats.js, config, agentId);
      for (const raw of pending) {
        await stream.writeSSE({ event: "message", data: raw });
      }

      // Heartbeat every 15 s to keep the connection alive through proxies
      const heartbeatTimer = setInterval(() => {
        stream.writeSSE({ event: "heartbeat", data: String(Date.now()) }).catch(() => {});
      }, 15_000);

      stream.onAbort(() => clearInterval(heartbeatTimer));

      // Bridge live NATS messages to SSE
      for await (const msg of sub) {
        const data = new TextDecoder().decode(msg.data);
        await stream.writeSSE({ event: "message", data });
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  PATCH /status — heartbeat / task status update
  // ─────────────────────────────────────────────────────────────

  app.patch("/status", async c => {
    const { agentId, taskId, status, message } =
      await c.req.json<{ agentId: string; taskId: string; status: TaskStatus; message?: string }>();

    if (!agentId || !taskId || !status) {
      return c.json({ error: "agentId, taskId, and status required" }, 400);
    }

    await registry.touch(agentId);

    // Publish status update to the agent's inbox so SSE subscribers receive it
    const statusEnvelope: Partial<Envelope> = {
      messageId:   uuid(),
      messageType: MessageType.STATUS,
      taskId,
      status:      status as TaskStatus,
      metadata:    message ? { message } : undefined,
      createdAt:   Date.now(),
      aampVersion: AAMP_VERSION,
    };

    const payload = new TextEncoder().encode(JSON.stringify(statusEnvelope));
    nats.nc.publish(subject(config.domain, agentId), payload);

    return c.json({ ok: true, taskId, status });
  });

  // ─────────────────────────────────────────────────────────────
  //  POST /inbound — receive messages from OTHER relays
  // ─────────────────────────────────────────────────────────────

  app.post("/inbound", async c => {
    const envelope: Envelope = await c.req.json();

    if (!envelope.messageId || !envelope.senderDid || !envelope.recipientDid) {
      return c.json({ error: "Invalid envelope: missing required fields" }, 400);
    }

    if (envelope.signature) {
      try {
        const valid = await verifyEnvelope(envelope, resolver);
        if (!valid) console.warn(`[relay/inbound] Signature invalid from ${envelope.senderDid} — passing`);
      } catch (err) {
        console.warn(`[relay/inbound] Signature verification error from ${envelope.senderDid}: ${String(err)} — passing`);
      }
    }

    const reg = await registry.get(envelope.recipientDid);
    const localAgentId = reg?.agentId ?? agentIdFromDid(envelope.recipientDid, config.domain);
    if (!localAgentId) {
      return c.json({
        error: `Recipient DID ${envelope.recipientDid} is not local to this relay (domain: ${config.domain})`,
      }, 404);
    }

    await deliverToAgent(envelope, localAgentId, config, nats);
    await registry.touch(localAgentId);
    console.log(`[relay] Inbound message ${envelope.messageId} delivered to ${localAgentId}`);
    return c.json({ messageId: envelope.messageId, status: "delivered" }, 202);
  });

  return app;
}

// ─────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────

function subject(domain: string, agentId: string): string {
  return `aamp.${domain}.${agentId}.inbox`;
}

async function routeEnvelope(
  envelope:   Envelope,
  config:     RelayConfig,
  nats:       NatsContext,
  federation: FederationRouter,
  registry:   AgentRegistry,
): Promise<void> {
  // Priority 1: replyToMailbox points to a local NATS subject — fast path for responses
  const isReplyType = (
    envelope.messageType === MessageType.RESPONSE      ||
    envelope.messageType === MessageType.PROBE_RESPONSE ||
    envelope.messageType === MessageType.STATUS        ||
    envelope.messageType === MessageType.CONFIRM       ||
    envelope.messageType === MessageType.CANCEL
  );
  const localPrefix = `aamp.${config.domain}.`;
  if (envelope.replyToMailbox?.startsWith(localPrefix) && isReplyType) {
    const subj    = envelope.replyToMailbox;
    const payload = new TextEncoder().encode(JSON.stringify(envelope));
    try {
      nats.nc.publish(subj, payload);
      console.log(`[relay] Delivered ${envelope.messageId} via replyToMailbox (${subj})`);
      return;
    } catch (err) {
      console.warn(`[relay] replyToMailbox delivery failed, falling back to DID routing:`, err);
    }
  }

  // Priority 2: recipient registered locally
  const localReg = await registry.get(envelope.recipientDid);
  if (localReg) {
    await deliverToAgent(envelope, localReg.agentId, config, nats);
    return;
  }

  // Priority 3: did:web DID on this relay's domain
  if (envelope.recipientDid.startsWith(`did:web:${config.domain}`)) {
    const agentId = agentIdFromDid(envelope.recipientDid, config.domain);
    if (!agentId) throw new Error(`Cannot resolve local agentId from ${envelope.recipientDid}`);
    await deliverToAgent(envelope, agentId, config, nats);
    return;
  }

  // Priority 4: federation — resolve DID → forward to remote relay
  console.log(`[relay] Federating message ${envelope.messageId} to ${envelope.recipientDid}`);
  const result = await federation.forwardToRemoteRelay(envelope);
  if (!result.success) throw new Error(`Federation failed: ${result.error}`);
  console.log(`[relay] Forwarded to ${result.relayUrl}`);
}

async function deliverToAgent(
  envelope: Envelope,
  agentId:  string,
  config:   RelayConfig,
  nats:     NatsContext,
): Promise<void> {
  const payload = new TextEncoder().encode(JSON.stringify(envelope));
  const subj    = subject(config.domain, agentId);

  // Core NATS publish — immediately received by any subscriber (SDK agent or SSE bridge)
  try {
    nats.nc.publish(subj, payload);
    console.log(`[relay] Delivered ${envelope.messageId} to ${agentId} via NATS (${subj})`);
  } catch (err) {
    console.warn(`[relay] NATS publish failed for ${agentId}:`, err);
    throw err;
  }

  // Persist to JetStream for durability (offline agents, SSE replay)
  try {
    await publishToMailbox(nats.js, config.domain, agentId, payload, envelope.messageId);
  } catch {
    // JetStream consumer may not exist yet — durability is best-effort in v0.1
  }
}
