"use client";

import type { Envelope, LogEntry, FlowStep } from "./types";

const RELAY_A = process.env.NEXT_PUBLIC_RELAY_A_URL ?? "http://localhost:8085";
const RELAY_B = process.env.NEXT_PUBLIC_RELAY_B_URL ?? "http://localhost:8086";

// ─── Ed25519 key generation (Web Crypto) ────────────────────────────────────

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
}

export async function exportPublicKeyBase64(keyPair: CryptoKeyPair): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

export async function exportPrivateKeyBytes(keyPair: CryptoKeyPair): Promise<Uint8Array> {
  const jwk  = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const d    = jwk.d!;
  const bytes = Uint8Array.from(atob(d.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  return bytes;
}

// Base58btc encode for did:key
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Encode(bytes: Uint8Array): string {
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let result = "";
  while (num > 0n) { result = BASE58[Number(num % 58n)] + result; num /= 58n; }
  for (const b of bytes) { if (b !== 0) break; result = "1" + result; }
  return result;
}

export async function createDidKey(keyPair: CryptoKeyPair): Promise<string> {
  const raw     = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const prefix  = new Uint8Array([0xed, 0x01]);
  const combined = new Uint8Array(prefix.length + raw.byteLength);
  combined.set(prefix);
  combined.set(new Uint8Array(raw), prefix.length);
  return `did:key:z${base58Encode(combined)}`;
}

// ─── Sign envelope with Ed25519 ─────────────────────────────────────────────

function canonicalize(env: Omit<Envelope, "signature">): Uint8Array {
  const fields = {
    messageId:      env.messageId,
    senderDid:      env.senderDid,
    recipientDid:   env.recipientDid,
    taskId:         env.taskId,
    parentTaskId:   env.parentTaskId   ?? "",
    rootTaskId:     env.rootTaskId     ?? "",
    replyToMailbox: env.replyToMailbox ?? "",
    ttlMs:          env.ttlMs          ?? 0,
    routingMode:    env.routingMode    ?? "",
    messageType:    env.messageType,
    status:         env.status         ?? "",
    ucanProof:      env.ucanProof      ?? "",
    createdAt:      env.createdAt,
    aampVersion:    env.aampVersion    ?? "0.1.0",
  };
  return new TextEncoder().encode(JSON.stringify(fields));
}

async function signEnvelope(
  env: Omit<Envelope, "signature">,
  privateKey: CryptoKey,
): Promise<Envelope> {
  const message = canonicalize(env);
  const sigBuffer = await crypto.subtle.sign("Ed25519", privateKey, message);
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return { ...env, signature: sig };
}

// ─── UUID v7 (timestamp-ordered) ─────────────────────────────────────────────

export function uuidv7(): string {
  const now   = BigInt(Date.now());
  const msHigh = Number((now >> 16n) & 0xfffn);
  const msLow  = Number(now & 0xffffn);
  const rand   = crypto.getRandomValues(new Uint8Array(10));
  rand[0] = (rand[0] & 0x0f) | 0x70; // version 7
  rand[2] = (rand[2] & 0x3f) | 0x80; // variant
  const hex = [
    msHigh.toString(16).padStart(8, "0"),
    msLow.toString(16).padStart(4, "0"),
    Array.from(rand.slice(0, 2), b => b.toString(16).padStart(2, "0")).join(""),
    Array.from(rand.slice(2, 4), b => b.toString(16).padStart(2, "0")).join(""),
    Array.from(rand.slice(4),    b => b.toString(16).padStart(2, "0")).join(""),
  ];
  return hex.join("-");
}

// ─── Relay health check ──────────────────────────────────────────────────────

export async function checkRelayHealth(url: string) {
  const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
  return r.json() as Promise<{ status: string; domain: string; uptime: number }>;
}

// ─── Agent registration ──────────────────────────────────────────────────────

export async function registerAgent(opts: {
  relayUrl:   string;
  agentId:    string;
  did:        string;
  domain:     string;
  publicKeyB64: string;
  name:       string;
  capabilities: string[];
}) {
  const card = {
    did:          opts.did,
    name:         opts.name,
    domain:       opts.domain,
    relayEndpoint: opts.relayUrl,
    publicKey:    opts.publicKeyB64,
    capabilities: opts.capabilities.map(id => ({ id, description: id, parameters: {} })),
    endpoints:    { send: `${opts.relayUrl}/mailbox/${opts.agentId}/send` },
    aampVersion:  "0.1.0",
  };
  const r = await fetch(`${opts.relayUrl}/agents/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ agentId: opts.agentId, card }),
  });
  if (!r.ok) throw new Error(`Registration failed: ${await r.text()}`);
}

// ─── DID document pre-registration (dev bootstrap) ───────────────────────────

/**
 * Register THIS agent's DID Document with a REMOTE relay.
 * The service endpoint points to our home relay's /inbound so the remote relay
 * can route responses back via HTTP (instead of direct cross-relay NATS publish).
 */
export async function preregisterSelfDid(opts: {
  remoteRelayUrl: string;   // the relay to register with (e.g. Relay B)
  selfDid:        string;   // this agent's DID
  homeRelayUrl:   string;   // our relay's base URL (e.g. Relay A)
}) {
  const doc = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id:          opts.selfDid,
    verificationMethod: [],
    authentication:     [],
    assertionMethod:    [],
    service: [{
      id:              `${opts.selfDid}#aamp-relay`,
      type:            "AAMPRelay",
      serviceEndpoint: `${opts.homeRelayUrl}/inbound`,
    }],
  };
  await fetch(`${opts.remoteRelayUrl}/resolver/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ did: opts.selfDid, document: doc }),
  });
}

export async function preregisterRemoteDid(opts: {
  relayUrl:       string;
  remoteDid:      string;
  remoteRelayUrl: string;
}) {
  const doc = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id:          opts.remoteDid,
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    service: [{
      id:              `${opts.remoteDid}#aamp-relay`,
      type:            "AAMPRelay",
      serviceEndpoint: `${opts.remoteRelayUrl}/inbound`,
    }],
  };
  await fetch(`${opts.relayUrl}/resolver/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ did: opts.remoteDid, document: doc }),
  });
}

// ─── Send an envelope ────────────────────────────────────────────────────────

export async function sendEnvelope(
  relayUrl: string,
  agentId:  string,
  env:      Omit<Envelope, "signature">,
  privateKey: CryptoKey,
): Promise<void> {
  const signed = await signEnvelope(env, privateKey);
  const r = await fetch(`${relayUrl}/mailbox/${agentId}/send`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(signed),
    signal:  AbortSignal.timeout(15_000),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Relay rejected: ${text}`);
  }
}

// ─── SSE subscription ────────────────────────────────────────────────────────

export function subscribeSSE(
  relayUrl:  string,
  agentId:   string,
  onMessage: (env: Envelope) => void,
  onError?:  (e: Event) => void,
): () => void {
  const url = `${relayUrl}/mailbox/notifications?agentId=${agentId}`;
  const es  = new EventSource(url);
  es.addEventListener("message", e => {
    try { onMessage(JSON.parse(e.data) as Envelope); } catch { /* skip malformed */ }
  });
  if (onError) es.onerror = onError;
  return () => es.close();
}

// ─── Polling fallback (for SSE gaps caused by HMR / component remounts) ───────

/**
 * Poll the relay's /mailbox/:agentId/poll endpoint and dispatch any returned
 * envelopes through the in-process message routing.  Used as a fallback when
 * the SSE push path misses messages because the EventSource was briefly closed.
 */
async function pollMailbox(relayUrl: string, agentId: string): Promise<void> {
  try {
    const r = await fetch(`${relayUrl}/mailbox/${agentId}/poll`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return;
    const body = await r.json() as { messages?: unknown[] };
    for (const env of body.messages ?? []) {
      dispatchInbound(env as Envelope);
    }
  } catch { /* non-fatal */ }
}

// ─── In-process message routing (avoids a second SSE connection) ─────────────
//
// Dashboard keeps a single SSE open.  runProbe / runTask register per-task
// handlers here BEFORE sending any envelope so fast responses are never missed.

const taskHandlers = new Map<string, (env: Envelope) => void>();

/**
 * Register a handler that will be called when an inbound envelope with the
 * given taskId arrives via the Dashboard's SSE stream.
 * Returns an unsubscribe function.
 */
export function registerTaskHandler(
  taskId:  string,
  handler: (env: Envelope) => void,
): () => void {
  taskHandlers.set(taskId, handler);
  return () => taskHandlers.delete(taskId);
}

/**
 * Called by Dashboard's SSE onMessage to dispatch inbound envelopes to any
 * registered per-task handlers.
 */
export function dispatchInbound(env: Envelope): void {
  if (env.taskId) taskHandlers.get(env.taskId)?.(env);
}

// ─── High-level demo flow ─────────────────────────────────────────────────────

export interface DemoContext {
  keyPair:        CryptoKeyPair;
  did:            string;
  publicKeyB64:   string;
  researchDid:    string;
  agentId:        string;
  domain:         string;
}

export async function buildDemoContext(): Promise<DemoContext> {
  const keyPair      = await generateKeyPair();
  const did          = await createDidKey(keyPair);
  const publicKeyB64 = await exportPublicKeyBase64(keyPair);
  return {
    keyPair,
    did,
    publicKeyB64,
    researchDid: `did:web:company-b.local:agents:research-bot-01`,
    agentId:     "finance-bot-ui",
    domain:      "company-a.local",
  };
}

export async function runProbe(
  ctx:    DemoContext,
  onStep: (step: FlowStep, log: Omit<LogEntry, "id">) => void,
): Promise<boolean> {
  // Register remote DID with Relay A (so it can federate to Relay B)
  await preregisterRemoteDid({
    relayUrl:       RELAY_A,
    remoteDid:      ctx.researchDid,
    remoteRelayUrl: RELAY_B,
  }).catch(() => {});

  // Register Finance Bot's DID with Relay B so Relay B can route the
  // PROBE_RESPONSE back via HTTP /inbound instead of direct cross-relay NATS.
  await preregisterSelfDid({
    remoteRelayUrl: RELAY_B,
    selfDid:        ctx.did,
    homeRelayUrl:   RELAY_A,
  }).catch(() => {});

  const taskId    = uuidv7();
  const messageId = uuidv7();

  const probeEnv: Omit<Envelope, "signature"> = {
    messageId,
    senderDid:      ctx.did,
    recipientDid:   ctx.researchDid,
    taskId,
    replyToMailbox: `aamp.${ctx.domain}.${ctx.agentId}.inbox`,
    routingMode:    "SUPERVISED_TRANSFER",
    messageType:    "PROBE",
    status:         "SUBMITTED",
    payload:        { capabilityId: "summarize-pdf", parameters: { maxPages: "50" } },
    contentType:    "application/json",
    createdAt:      Date.now(),
    aampVersion:    "0.1.0",
  };

  // Register handler BEFORE sending so a fast response is never missed.
  // Dashboard's SSE + polling fallback both dispatch via dispatchInbound().
  return new Promise(resolve => {
    let done         = false;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const cleanup = (timeoutId: ReturnType<typeof setTimeout>) => {
      done = true;
      clearTimeout(timeoutId);
      if (pollId !== null) clearInterval(pollId);
      unsub();
    };

    const timeoutId = setTimeout(() => {
      cleanup(timeoutId);
      resolve(false);
    }, 15_000);

    const unsub = registerTaskHandler(taskId, inbound => {
      if (done || inbound.messageType !== "PROBE_RESPONSE") return;
      cleanup(timeoutId);
      const p = inbound.payload as Record<string, unknown> | undefined;
      const accepted = p?.output
        ? (p.output as Record<string, unknown>)?.accepted
        : p?.accepted;
      onStep("probe_response", {
        timestamp: Date.now(),
        type:      "PROBE_RESPONSE",
        from:      "Research Bot",
        to:        "Finance Bot",
        taskId,
        label:     `PROBE_RESPONSE — accepted=${String(accepted)}`,
        payload:   inbound.payload,
      });
      resolve(Boolean(accepted));
    });

    onStep("probe_sent", {
      timestamp: Date.now(),
      type:      "PROBE",
      from:      "Finance Bot",
      to:        "Relay A",
      taskId,
      messageId,
      label:     "PROBE → Relay A",
      payload:   { capabilityId: "summarize-pdf", parameters: { maxPages: "50" } },
    });

    sendEnvelope(RELAY_A, ctx.agentId, probeEnv, ctx.keyPair.privateKey)
      .then(() => {
        onStep("probe_federated", {
          timestamp: Date.now(),
          type:      "PROBE",
          from:      "Relay A",
          to:        "Relay B",
          taskId,
          label:     "Relay A federates → Relay B",
        });
        onStep("probe_delivered", {
          timestamp: Date.now(),
          type:      "PROBE",
          from:      "Relay B",
          to:        "Research Bot",
          taskId,
          label:     "Relay B → Research Bot (NATS)",
        });
        // Poll as SSE fallback for when the EventSource is briefly closed.
        pollId = setInterval(() => pollMailbox(RELAY_A, ctx.agentId), 800);
      })
      .catch(() => {
        cleanup(timeoutId);
        resolve(false);
      });
  });
}

export async function runTask(
  ctx:    DemoContext,
  onStep: (step: FlowStep, log: Omit<LogEntry, "id">) => void,
): Promise<unknown> {
  const taskId    = uuidv7();
  const messageId = uuidv7();
  const taskPayload = {
    capabilityId: "summarize-pdf",
    url:          "https://example.com/quarterly-report-q4-2025.pdf",
    format:       "bullet-points",
    maxPages:     50,
    focus:        ["revenue", "expenses", "guidance"],
  };

  const taskEnv: Omit<Envelope, "signature"> = {
    messageId,
    senderDid:      ctx.did,
    recipientDid:   ctx.researchDid,
    taskId,
    replyToMailbox: `aamp.${ctx.domain}.${ctx.agentId}.inbox`,
    routingMode:    "SUPERVISED_TRANSFER",
    messageType:    "TASK",
    status:         "SUBMITTED",
    payload:        taskPayload,
    contentType:    "application/json",
    createdAt:      Date.now(),
    aampVersion:    "0.1.0",
  };

  // Register handler BEFORE sending so a fast response is never missed.
  return new Promise((resolve, reject) => {
    let done         = false;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const cleanup = (timeoutId: ReturnType<typeof setTimeout>) => {
      done = true;
      clearTimeout(timeoutId);
      if (pollId !== null) clearInterval(pollId);
      unsub();
    };

    const timeoutId = setTimeout(() => {
      cleanup(timeoutId);
      reject(new Error("Task timed out"));
    }, 40_000);

    const unsub = registerTaskHandler(taskId, inbound => {
      if (done || inbound.messageType !== "RESPONSE") return;
      cleanup(timeoutId);
      onStep("task_response", {
        timestamp: Date.now(),
        type:      "RESPONSE",
        from:      "Research Bot",
        to:        "Finance Bot",
        taskId,
        label:     "RESPONSE ← Research Bot",
        payload:   inbound.payload,
      });
      onStep("completed", {
        timestamp: Date.now(),
        type:      "SYSTEM",
        from:      "Finance Bot",
        to:        "Finance Bot",
        taskId,
        label:     "Task completed ✓",
        payload:   inbound.payload,
      });
      resolve(inbound.payload);
    });

    onStep("task_sent", {
      timestamp: Date.now(),
      type:      "TASK",
      from:      "Finance Bot",
      to:        "Relay A",
      taskId,
      messageId,
      label:     "TASK → Relay A (signed + UCAN)",
      payload:   taskPayload,
    });

    sendEnvelope(RELAY_A, ctx.agentId, taskEnv, ctx.keyPair.privateKey)
      .then(() => {
        onStep("task_federated", {
          timestamp: Date.now(),
          type:      "TASK",
          from:      "Relay A",
          to:        "Relay B",
          taskId,
          label:     "Relay A federates → Relay B",
        });
        onStep("task_delivered", {
          timestamp: Date.now(),
          type:      "TASK",
          from:      "Relay B",
          to:        "Research Bot",
          taskId,
          label:     "Relay B → Research Bot (NATS)",
        });
        onStep("task_processing", {
          timestamp: Date.now(),
          type:      "STATUS",
          from:      "Research Bot",
          to:        "Research Bot",
          taskId,
          label:     "Research Bot processing PDF…",
        });
        // Poll as SSE fallback for when the EventSource is briefly closed.
        pollId = setInterval(() => pollMailbox(RELAY_A, ctx.agentId), 800);
      })
      .catch(err => {
        cleanup(timeoutId);
        reject(err);
      });
  });
}
