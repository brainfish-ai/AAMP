/**
 * AAMP Relay — Node.js entry point (Vercel Sandbox / local dev).
 *
 * Identical behaviour to the Cloudflare Workers relay but runs as a plain
 * Node.js HTTP server using:
 *   - @hono/node-server  (instead of Workers fetch handler)
 *   - nats (TCP)         (instead of nats.ws WebSocket)
 *   - MemoryAgentRegistry (instead of Cloudflare KV)
 *
 * Usage:
 *   RELAY_DOMAIN=company-c.sandbox \
 *   RELAY_PORT=8087 \
 *   NATS_URL=wss://connect.ngs.global \
 *   NATS_CREDS=<token> \
 *   node --import tsx/esm packages/relay/src/index-node.ts
 */

import { serve } from "@hono/node-server";
import { Hono }  from "hono";
import { streamSSE } from "hono/streaming";
import { cors }  from "hono/cors";
import {
  connect,
  credsAuthenticator,
  tokenAuthenticator,
  type NatsConnection,
  type JetStreamManager,
  type JetStreamClient,
  AckPolicy,
  RetentionPolicy,
  StorageType,
} from "nats";
import {
  type Envelope,
  type AgentCard,
  MessageType,
  TaskStatus,
  AAMP_VERSION,
} from "@aamp/core";
import { DIDResolver, verifyEnvelope, publicKeyToMultibase, createDidWebDocument } from "@aamp/identity";
import { MemoryAgentRegistry } from "./registry-memory.js";
import { FederationRouter }    from "./federation.js";
import type { RelayConfig }    from "./config.js";

// ─── Config from env ──────────────────────────────────────────────────────────

const PORT        = parseInt(process.env.RELAY_PORT      ?? "8087", 10);
const DOMAIN      = process.env.RELAY_DOMAIN     ?? "company-c.sandbox";
const PUBLIC_URL  = process.env.RELAY_PUBLIC_URL ?? `http://localhost:${PORT}`;
const NATS_URL    = process.env.NATS_URL          ?? "wss://connect.ngs.global";
const NATS_CREDS  = process.env.NATS_CREDS;
const STREAM_NAME = process.env.RELAY_STREAM_NAME ?? "AAMP_MESSAGES_C";

const config: RelayConfig = {
  natsUrl:                NATS_URL,
  natsCreds:              NATS_CREDS,
  publicUrl:              PUBLIC_URL,
  domain:                 DOMAIN,
  maxTtlMs:               24 * 60 * 60 * 1000,
  streamName:             STREAM_NAME,
  requireCapabilityProof: false,
  strictAuth:             false,
};

// ─── NATS connect (TCP, not WebSocket) ───────────────────────────────────────

function toTcpNatsUrl(url: string): string {
  // The nats package is TCP-only. Convert WebSocket URLs to their TCP equivalents
  // so Node.js relay/agents can connect to Synadia Cloud from non-Workers runtimes.
  if (url.startsWith("wss://")) return url.replace("wss://", "tls://");
  if (url.startsWith("ws://"))  return url.replace("ws://",  "nats://");
  return url;
}

async function connectNats(): Promise<{ nc: NatsConnection; jsm: JetStreamManager; js: JetStreamClient }> {
  const opts: Parameters<typeof connect>[0] = { servers: toTcpNatsUrl(NATS_URL) };

  if (NATS_CREDS) {
    const creds = NATS_CREDS.trim();
    opts.authenticator = creds.startsWith("-----BEGIN NATS")
      ? credsAuthenticator(new TextEncoder().encode(creds))
      : tokenAuthenticator(creds);
  }

  const nc  = await connect(opts);
  const jsm = await nc.jetstreamManager();
  const js  = nc.jetstream();

  // Ensure stream exists
  try {
    await jsm.streams.info(STREAM_NAME);
  } catch {
    await jsm.streams.add({
      name:             STREAM_NAME,
      subjects:         [`aamp.${DOMAIN}.*.inbox`],
      retention:        RetentionPolicy.Workqueue,
      storage:          StorageType.File,
      max_bytes:        256 * 1024 * 1024,              // 256 MB — required by Synadia NGS
      max_age:          config.maxTtlMs * 1_000_000,
      max_msg_size:     4 * 1024 * 1024,
      duplicate_window: 60_000_000_000,
      num_replicas:     1,
    });
    console.log(`[nats] Created stream ${STREAM_NAME}`);
  }
  console.log(`[nats] Connected to ${NATS_URL}`);
  return { nc, jsm, js };
}

// ─── Build Hono app ───────────────────────────────────────────────────────────

function buildNodeApp(
  nats: { nc: NatsConnection; jsm: JetStreamManager; js: JetStreamClient },
) {
  const app      = new Hono();
  const registry = new MemoryAgentRegistry();
  const resolver = new DIDResolver();
  const federation = new FederationRouter(resolver);
  const START_TIME = Date.now();

  app.use("*", cors({ origin: "*" }));

  // Health
  app.get("/health", c => c.json({
    status: "ok", aampVersion: AAMP_VERSION,
    domain: DOMAIN, provider: "vercel-sandbox",
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: Date.now(),
  }));

  // DID pre-registration
  app.post("/resolver/register", async c => {
    const { did, document } = await c.req.json<{ did: string; document: Record<string, unknown> }>();
    if (!did || !document) return c.json({ error: "did and document required" }, 400);
    resolver.register(did, document as Parameters<typeof resolver.register>[1]);
    return c.json({ did, registered: true }, 201);
  });

  // Agent registration
  app.post("/agents/register", async c => {
    const { agentId, card } = await c.req.json<{ agentId: string; card: AgentCard }>();
    if (!agentId || !card) return c.json({ error: "agentId and card required" }, 400);

    let didDocument = {
      "@context":         ["https://www.w3.org/ns/did/v1"],
      id:                 card.did,
      verificationMethod: [] as unknown[],
      authentication:     [] as unknown[],
      assertionMethod:    [] as unknown[],
      service:            [{ id: `${card.did}#aamp-relay`, type: "AAMPRelay", serviceEndpoint: `${PUBLIC_URL}/inbound` }],
    };

    if (card.publicKey) {
      try {
        const pubKeyBytes = new Uint8Array(
          Array.from(atob(card.publicKey as string), ch => ch.charCodeAt(0)),
        );
        const multibase = publicKeyToMultibase(pubKeyBytes);
        const keyId = `${card.did}#key-1`;
        didDocument = {
          ...didDocument,
          verificationMethod: [{ id: keyId, type: "Ed25519VerificationKey2020", controller: card.did, publicKeyMultibase: multibase }],
          authentication:     [keyId],
          assertionMethod:    [keyId],
        };
        resolver.register(card.did, didDocument as Parameters<typeof resolver.register>[1]);
      } catch {}
    }

    await registry.registerWithDocument(agentId, card, didDocument as Parameters<typeof registry.registerWithDocument>[2]);

    // Ensure durable consumer
    const consumerName = `agent-${agentId}`;
    try {
      await nats.jsm.consumers.info(STREAM_NAME, consumerName);
    } catch {
      await nats.jsm.consumers.add(STREAM_NAME, {
        durable_name:   consumerName,
        filter_subject: `aamp.${DOMAIN}.${agentId}.inbox`,
        ack_policy:     AckPolicy.Explicit,
        max_deliver:    5,
        ack_wait:       30_000_000_000,
      }).catch(() => {});
    }

    console.log(`[relay-node] Agent registered: ${agentId} (${card.did})`);
    return c.json({ agentId, did: card.did, mailboxSubject: `aamp.${DOMAIN}.${agentId}.inbox` }, 201);
  });

  // Agent directory
  app.get("/agents",        async c => c.json(await registry.list()));
  app.get("/agents/:id",    async c => {
    const reg = await registry.get(c.req.param("id"));
    return reg ? c.json(reg.card) : c.json({ error: "not found" }, 404);
  });
  app.get("/agents/:id/did.json", async c => {
    const reg = await registry.get(c.req.param("id"));
    if (!reg) return c.json({ error: "not found" }, 404);
    return new Response(JSON.stringify(reg.didDocument), { headers: { "Content-Type": "application/did+json" } });
  });

  // Poll
  app.get("/mailbox/:agentId/poll", async c => {
    const { agentId } = c.req.param();
    const messages: string[] = [];
    try {
      const consumerName = `agent-${agentId}`;
      const iter = nats.js.fetch(STREAM_NAME, consumerName, { batch: 50, expires: 500 });
      for await (const msg of iter) {
        messages.push(new TextDecoder().decode(msg.data));
        msg.ack();
      }
    } catch {}
    return c.json({ messages: messages.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean) });
  });

  // Send
  app.post("/mailbox/:agentId/send", async c => {
    const body: Envelope = await c.req.json();
    const envelope: Envelope = { ...body, aampVersion: AAMP_VERSION, createdAt: body.createdAt ?? Date.now(), messageId: body.messageId ?? crypto.randomUUID() };

    await routeEnvelope(envelope, config, nats, federation, registry, resolver);
    return c.json({ messageId: envelope.messageId, taskId: envelope.taskId, status: "queued" }, 202);
  });

  // SSE notifications
  app.get("/mailbox/notifications", c => {
    const agentId = c.req.query("agentId");
    if (!agentId) return c.json({ error: "agentId required" }, 400);

    const subject = `aamp.${DOMAIN}.${agentId}.inbox`;

    return streamSSE(c, async stream => {
      const sub = nats.nc.subscribe(subject);
      stream.onAbort(() => sub.unsubscribe());
      await stream.writeSSE({ event: "connected", data: "{}" });

      const heartbeat = setInterval(() => {
        stream.writeSSE({ event: "heartbeat", data: String(Date.now()) }).catch(() => {});
      }, 15_000);
      stream.onAbort(() => clearInterval(heartbeat));

      for await (const msg of sub) {
        await stream.writeSSE({ event: "message", data: new TextDecoder().decode(msg.data) });
      }
    });
  });

  // Status heartbeat
  app.patch("/status", async c => {
    const { agentId, taskId, status } = await c.req.json<{ agentId: string; taskId: string; status: TaskStatus }>();
    if (!agentId || !taskId || !status) return c.json({ error: "agentId, taskId, and status required" }, 400);
    await registry.touch(agentId);
    const payload = new TextEncoder().encode(JSON.stringify({ messageId: crypto.randomUUID(), messageType: MessageType.STATUS, taskId, status, createdAt: Date.now(), aampVersion: AAMP_VERSION }));
    nats.nc.publish(`aamp.${DOMAIN}.${agentId}.inbox`, payload);
    return c.json({ ok: true, taskId, status });
  });

  // Inbound federation
  app.post("/inbound", async c => {
    const envelope: Envelope = await c.req.json();
    const reg = await registry.get(envelope.recipientDid);
    const agentId = reg?.agentId ?? envelope.recipientDid.split(":").pop();
    if (!agentId) return c.json({ error: "Recipient not local" }, 404);

    const payload = new TextEncoder().encode(JSON.stringify(envelope));
    nats.nc.publish(`aamp.${DOMAIN}.${agentId}.inbox`, payload);
    try {
      await nats.js.publish(`aamp.${DOMAIN}.${agentId}.inbox`, payload, { msgID: envelope.messageId });
    } catch {}
    await registry.touch(agentId);
    console.log(`[relay-node] Inbound: ${envelope.messageId} → ${agentId}`);
    return c.json({ messageId: envelope.messageId, status: "delivered" }, 202);
  });

  return app;
}

// ─── Routing helper (mirrors server.ts) ──────────────────────────────────────

async function routeEnvelope(
  envelope:   Envelope,
  config:     RelayConfig,
  nats:       { nc: NatsConnection; jsm: JetStreamManager; js: JetStreamClient },
  federation: FederationRouter,
  registry:   MemoryAgentRegistry,
  resolver:   DIDResolver,
): Promise<void> {
  const isReplyType = [MessageType.RESPONSE, MessageType.PROBE_RESPONSE, MessageType.STATUS, MessageType.CONFIRM, MessageType.CANCEL].includes(envelope.messageType as MessageType);

  // All AAMP relays share the same NATS cluster — publish directly to replyToMailbox
  // even for cross-domain subjects (e.g. aamp.company-a.workers.dev.finance-bot-01.inbox).
  if (isReplyType && envelope.replyToMailbox) {
    nats.nc.publish(envelope.replyToMailbox, new TextEncoder().encode(JSON.stringify(envelope)));
    return;
  }

  const localReg = await registry.get(envelope.recipientDid);
  if (localReg) {
    deliver(envelope, localReg.agentId, nats, config);
    return;
  }

  if (envelope.recipientDid.startsWith(`did:web:${DOMAIN}`)) {
    const agentId = envelope.recipientDid.split(":").pop()!;
    deliver(envelope, agentId, nats, config);
    return;
  }

  // Federation: forward to remote relay
  const result = await federation.forwardToRemoteRelay(envelope);
  if (!result.success) throw new Error(`Federation failed: ${result.error}`);
}

function deliver(
  envelope: Envelope,
  agentId:  string,
  nats:     { nc: NatsConnection; js: JetStreamClient },
  config:   RelayConfig,
): void {
  const payload = new TextEncoder().encode(JSON.stringify(envelope));
  const subj    = `aamp.${config.domain}.${agentId}.inbox`;
  nats.nc.publish(subj, payload);
  nats.js.publish(subj, payload, { msgID: envelope.messageId }).catch(() => {});
}

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const nats = await connectNats();
  const app  = buildNodeApp(nats);

  serve({ fetch: app.fetch, port: PORT }, info => {
    console.log(`[relay-node] Relay C (${DOMAIN}) listening on http://localhost:${info.port}`);
    console.log(`[relay-node] Provider: Vercel Sandbox`);
  });
}

main().catch(err => {
  console.error("[relay-node] Fatal:", err);
  process.exit(1);
});
