/**
 * AampAgent — the primary SDK class.
 *
 * Usage:
 *
 *   const agent = new AampAgent({
 *     did: 'did:key:z6Mk...',
 *     privateKey: keypair.privateKey,
 *     relayUrl: 'http://localhost:8080',
 *     natsUrl: 'nats://localhost:4222',   // optional — falls back to HTTP SSE
 *   });
 *
 *   await agent.connect();
 *
 *   // Send a task to another agent
 *   const result = await agent.send({
 *     to: 'did:web:acme.com/agents/research-bot',
 *     capability: 'summarize-pdf',
 *     payload: { url: 'https://example.com/report.pdf' },
 *   });
 *
 *   // Listen for incoming tasks
 *   agent.on('task', async (envelope, respond) => {
 *     const output = await myHandler(envelope);
 *     await respond({ success: true, output });
 *   });
 *
 *   // Graceful shutdown
 *   await agent.disconnect();
 */

import { connect, credsAuthenticator, tokenAuthenticator, type NatsConnection, type Subscription } from "nats";
import { v7 as uuidv7 } from "uuid";
import {
  type Envelope,
  type AgentCard,
  type TaskResult,
  type TaskPayload,
  type ProbeRequest,
  type ProbeResponse,
  MessageType,
  TaskStatus,
  RoutingMode,
  AAMP_VERSION,
} from "@aamp/core";
import {
  type KeyPair,
  DIDResolver,
  signEnvelope,
  issueCapabilityToken,
} from "@aamp/identity";

// ─────────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────────

export interface AampAgentOptions {
  /** This agent's Decentralized Identifier */
  did: string;
  /** Ed25519 private key (32 bytes) */
  privateKey: Uint8Array;
  /** AAMP Relay HTTP URL (e.g. http://localhost:8080) */
  relayUrl: string;
  /** NATS server URL — optional; if provided, agent connects via NATS directly */
  natsUrl?: string;
  /** NATS credentials — NKey/JWT .creds file contents or simple access token */
  natsCreds?: string;
  /** Agent's human-readable name */
  name?: string;
  /** Capabilities this agent exposes */
  capabilities?: AgentCard["capabilities"];
  /** Agent domain (used for mailbox subject construction) */
  domain?: string;
  /** Agent ID within the domain (extracted from DID if not provided) */
  agentId?: string;
}

export type TaskHandler = (
  envelope: Envelope,
  respond: (result: Partial<TaskResult>) => Promise<void>,
) => Promise<void>;

export type EventType = "task" | "status" | "probe" | "error" | "connected" | "disconnected";

// ─────────────────────────────────────────────────────────────
//  AampAgent
// ─────────────────────────────────────────────────────────────

export class AampAgent {
  private opts:       AampAgentOptions;
  private nc?:        NatsConnection;
  private sub?:       Subscription;
  private sseAbort?:  AbortController;
  private handlers:   Map<EventType, TaskHandler[]> = new Map();
  private resolver:   DIDResolver;
  private keyPair:    KeyPair;
  private agentId:    string;
  private domain:     string;
  private connected = false;

  constructor(opts: AampAgentOptions) {
    this.opts     = opts;
    this.resolver = new DIDResolver();
    this.keyPair  = { privateKey: opts.privateKey, publicKey: new Uint8Array() };
    this.domain   = opts.domain ?? "localhost";
    this.agentId  = opts.agentId ?? this.extractAgentId(opts.did);
  }

  // ─────────────────────────────────────────────────────────────
  //  Lifecycle
  // ─────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    // Derive public key from private key
    const { ed } = await import("@aamp/identity");
    this.keyPair.publicKey = await ed.getPublicKeyAsync(this.opts.privateKey);

    // Register with relay
    await this.registerWithRelay();

    // Connect transport
    if (this.opts.natsUrl) {
      await this.connectViaNats();
    } else {
      this.connectViaSse();
    }

    this.connected = true;
    this.emit("connected", null);
    console.log(`[aamp-agent] ${this.opts.did} connected`);
  }

  async disconnect(): Promise<void> {
    this.sseAbort?.abort();
    this.sub?.unsubscribe();
    await this.nc?.drain();
    this.connected = false;
    this.emit("disconnected", null);
  }

  // ─────────────────────────────────────────────────────────────
  //  Sending
  // ─────────────────────────────────────────────────────────────

  /**
   * Send a task to another agent.
   * Returns a Promise that resolves when the response arrives
   * (or rejects if TTL expires or task fails).
   */
  async send(opts: {
    to:             string;
    capability:     string;
    payload:        unknown;
    routingMode?:   RoutingMode;
    ttlMs?:         number;
    timeoutMs?:     number;
  }): Promise<TaskResult> {
    const taskId    = uuidv7();
    const messageId = uuidv7();
    const replySubject = `aamp.${this.domain}.${this.agentId}.inbox`;

    // Issue a capability token scoped to this specific task
    const token = await issueCapabilityToken(
      {
        issuerDid:    this.opts.did,
        audienceDid:  opts.to,
        capabilities: [
          {
            resource: `aamp:agent:${opts.to}`,
            ability:  `aamp/${opts.capability}`,
          },
        ],
        expiresInSecs: Math.ceil((opts.ttlMs ?? 300_000) / 1000),
      },
      this.opts.privateKey,
    );

    const taskPayload: TaskPayload = {
      capabilityId: opts.capability,
      input:        opts.payload,
    };

    const unsigned: Omit<Envelope, "signature"> = {
      messageId,
      senderDid:      this.opts.did,
      recipientDid:   opts.to,
      taskId,
      replyToMailbox: replySubject,
      ttlMs:          opts.ttlMs ?? 300_000,
      routingMode:    opts.routingMode ?? RoutingMode.SUPERVISED_TRANSFER,
      messageType:    MessageType.TASK,
      status:         TaskStatus.SUBMITTED,
      ucanProof:      JSON.stringify(token),
      payload:        taskPayload,
      contentType:    "application/json",
      createdAt:      Date.now(),
      aampVersion:    AAMP_VERSION,
    };

    const envelope = await signEnvelope(unsigned, this.opts.privateKey);

    // POST to relay
    const response = await fetch(`${this.opts.relayUrl}/mailbox/${this.agentId}/send`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(envelope),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Relay rejected message: ${err}`);
    }

    // Wait for response via NATS or SSE (pending response tracking)
    return this.waitForResponse(taskId, opts.timeoutMs ?? 60_000);
  }

  /**
   * Send a capability probe to check if an agent can handle a task
   * before committing resources.
   */
  async probe(opts: {
    to:           string;
    capabilityId: string;
    parameters?:  Record<string, string>;
    timeoutMs?:   number;
  }): Promise<ProbeResponse> {
    const taskId    = uuidv7();
    const messageId = uuidv7();

    const probePayload: ProbeRequest = {
      capabilityId: opts.capabilityId,
      parameters:   opts.parameters,
    };

    const unsigned: Omit<Envelope, "signature"> = {
      messageId,
      senderDid:      this.opts.did,
      recipientDid:   opts.to,
      taskId,
      replyToMailbox: `aamp.${this.domain}.${this.agentId}.inbox`,
      routingMode:    RoutingMode.SUPERVISED_TRANSFER,
      messageType:    MessageType.PROBE,
      status:         TaskStatus.SUBMITTED,
      payload:        probePayload,
      contentType:    "application/json",
      createdAt:      Date.now(),
      aampVersion:    AAMP_VERSION,
    };

    const envelope = await signEnvelope(unsigned, this.opts.privateKey);

    await fetch(`${this.opts.relayUrl}/mailbox/${this.agentId}/send`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(envelope),
    });

    // waitForResponse resolves to the TaskResult; the ProbeResponse lives in .output
    const result = await this.waitForResponse(taskId, opts.timeoutMs ?? 10_000);
    if (result && typeof result === "object" && "output" in result) {
      return result.output as ProbeResponse;
    }
    return result as unknown as ProbeResponse;
  }

  /**
   * Send a status heartbeat update to the relay.
   */
  async updateStatus(taskId: string, status: TaskStatus, message?: string): Promise<void> {
    await fetch(`${this.opts.relayUrl}/status`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ agentId: this.agentId, taskId, status, message }),
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  Event handlers
  // ─────────────────────────────────────────────────────────────

  on(event: EventType, handler: TaskHandler): this {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
    return this;
  }

  off(event: EventType, handler: TaskHandler): this {
    const handlers = this.handlers.get(event) ?? [];
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
    return this;
  }

  // ─────────────────────────────────────────────────────────────
  //  Internal: transports
  // ─────────────────────────────────────────────────────────────

  private async connectViaNats(): Promise<void> {
    // The nats package uses TCP (nats:// / tls://). In Cloudflare Workers,
    // nats.ws handles wss:// URLs. For Node.js environments, transform
    // wss:// → tls:// and ws:// → nats:// so the TCP client can connect.
    const rawUrl = this.opts.natsUrl!;
    const serverUrl = rawUrl.startsWith("wss://")
      ? rawUrl.replace("wss://", "tls://")
      : rawUrl.startsWith("ws://")
        ? rawUrl.replace("ws://", "nats://")
        : rawUrl;

    const connectOpts: Parameters<typeof connect>[0] = { servers: serverUrl };
    const creds = (this.opts.natsCreds ?? process.env["NATS_CREDS"] ?? "").trim();
    if (creds) {
      if (creds.startsWith("-----BEGIN NATS")) {
        connectOpts.authenticator = credsAuthenticator(new TextEncoder().encode(creds));
      } else {
        connectOpts.authenticator = tokenAuthenticator(creds);
      }
    }

    this.nc  = await connect(connectOpts);
    const subject = `aamp.${this.domain}.${this.agentId}.inbox`;
    this.sub = this.nc.subscribe(subject);

    (async () => {
      for await (const msg of this.sub!) {
        try {
          const envelope: Envelope = JSON.parse(new TextDecoder().decode(msg.data));
          await this.handleIncoming(envelope);
        } catch (err) {
          console.error("[aamp-agent] Failed to parse NATS message:", err);
        }
      }
    })().catch(console.error);

    console.log(`[aamp-agent] Subscribed to NATS subject: ${subject}`);
  }

  private connectViaSse(): void {
    this.sseAbort = new AbortController();
    const url = `${this.opts.relayUrl}/mailbox/notifications?agentId=${encodeURIComponent(this.agentId)}`;

    const listen = async () => {
      try {
        const response = await fetch(url, {
          signal: this.sseAbort!.signal,
          headers: { Accept: "text/event-stream" },
        });

        if (!response.body) throw new Error("No SSE response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLine = event.split("\n").find(l => l.startsWith("data: "));
            if (!dataLine) continue;
            try {
              const envelope: Envelope = JSON.parse(dataLine.slice(6));
              await this.handleIncoming(envelope);
            } catch {
              // malformed event
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[aamp-agent] SSE error, reconnecting in 3s:", err);
          setTimeout(listen, 3000);
        }
      }
    };

    listen().catch(console.error);
    console.log(`[aamp-agent] Connected to SSE at ${url}`);
  }

  // ─────────────────────────────────────────────────────────────
  //  Internal: message handling
  // ─────────────────────────────────────────────────────────────

  private pendingResponses = new Map<string, {
    resolve: (r: TaskResult) => void;
    reject:  (e: Error) => void;
    timer:   ReturnType<typeof setTimeout>;
  }>();

  private async handleIncoming(envelope: Envelope): Promise<void> {
    // Resolve pending send() calls
    const pending = this.pendingResponses.get(envelope.taskId);
    if (pending && (envelope.messageType === MessageType.RESPONSE || envelope.messageType === MessageType.PROBE_RESPONSE || envelope.status === TaskStatus.COMPLETED)) {
      clearTimeout(pending.timer);
      this.pendingResponses.delete(envelope.taskId);
      pending.resolve(envelope.payload as TaskResult);
      return;
    }

    if (pending && envelope.status === TaskStatus.FAILED) {
      clearTimeout(pending.timer);
      this.pendingResponses.delete(envelope.taskId);
      const result = envelope.payload as TaskResult;
      pending.reject(new Error(result?.errorMessage ?? "Task failed"));
      return;
    }

    // Dispatch to registered event handlers
    const respond = async (result: Partial<TaskResult>): Promise<void> => {
      await this.sendResponse(envelope, result);
    };

    const eventType = this.messageTypeToEvent(envelope.messageType);
    const handlers  = this.handlers.get(eventType) ?? [];

    if (handlers.length === 0 && eventType === "task") {
      // No handler registered — respond with not-implemented
      await this.sendResponse(envelope, {
        success:      false,
        errorCode:    "NOT_IMPLEMENTED",
        errorMessage: `No handler registered for capability`,
      });
      return;
    }

    for (const handler of handlers) {
      await handler(envelope, respond).catch(async err => {
        console.error(`[aamp-agent] Handler error for task ${envelope.taskId}:`, err);
        await this.sendResponse(envelope, {
          success:      false,
          errorCode:    "HANDLER_ERROR",
          errorMessage: String(err),
        });
      });
    }
  }

  private async sendResponse(originalEnvelope: Envelope, result: Partial<TaskResult>): Promise<void> {
    const replyTo = originalEnvelope.replyToMailbox;
    if (!replyTo) return;

    const unsigned: Omit<Envelope, "signature"> = {
      messageId:      uuidv7(),
      senderDid:      this.opts.did,
      recipientDid:   originalEnvelope.senderDid,
      taskId:         originalEnvelope.taskId,
      rootTaskId:     originalEnvelope.rootTaskId ?? originalEnvelope.taskId,
      // Carry replyToMailbox forward so the receiving relay can route the response
      // back to the correct NATS subject even across relay domain boundaries.
      replyToMailbox: originalEnvelope.replyToMailbox,
      routingMode:    RoutingMode.SUPERVISED_TRANSFER,
      messageType:    MessageType.RESPONSE,
      status:         result.success ? TaskStatus.COMPLETED : TaskStatus.FAILED,
      payload:        result,
      contentType:    "application/json",
      createdAt:      Date.now(),
      aampVersion:    AAMP_VERSION,
    };

    const envelope = await signEnvelope(unsigned, this.opts.privateKey);

    await fetch(`${this.opts.relayUrl}/mailbox/${this.agentId}/send`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(envelope),
    }).catch(err => console.error("[aamp-agent] Failed to send response:", err));
  }

  private waitForResponse(taskId: string, timeoutMs: number): Promise<TaskResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingResponses.delete(taskId);
        reject(new Error(`Task ${taskId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingResponses.set(taskId, { resolve, reject, timer });
    });
  }

  private async registerWithRelay(): Promise<void> {
    const card: AgentCard = {
      aampVersion:           AAMP_VERSION,
      did:                   this.opts.did,
      name:                  this.opts.name ?? this.agentId,
      endpoint:              this.opts.relayUrl,
      mailboxSubject:        `aamp.${this.domain}.${this.agentId}.inbox`,
      capabilities:          this.opts.capabilities ?? [],
      supportedRoutingModes: [RoutingMode.BLIND_TRANSFER, RoutingMode.SUPERVISED_TRANSFER, RoutingMode.SIDEBAR],
      authMethods:           ["ucan", "did-key"],
      publicKey:             Buffer.from(this.keyPair.publicKey).toString("base64"),
      updatedAt:             Date.now(),
    };

    const response = await fetch(`${this.opts.relayUrl}/agents/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ agentId: this.agentId, card, publicKey: card.publicKey }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to register with relay: ${err}`);
    }

    console.log(`[aamp-agent] Registered ${this.agentId} with relay at ${this.opts.relayUrl}`);
  }

  private extractAgentId(did: string): string {
    if (did.startsWith("did:web:")) {
      const parts = did.split(":");
      return parts[parts.length - 1];
    }
    if (did.startsWith("did:key:")) {
      return did.slice("did:key:".length, "did:key:".length + 12);
    }
    return did.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  }

  private messageTypeToEvent(type: MessageType): EventType {
    switch (type) {
      case MessageType.TASK:           return "task";
      case MessageType.STATUS:         return "status";
      case MessageType.PROBE:          return "probe";
      case MessageType.RESPONSE:       return "task";
      default:                         return "task";
    }
  }

  private emit(event: EventType, _envelope: unknown): void {
    // Internal emitter for lifecycle events
    const handlers = this.handlers.get(event) ?? [];
    for (const h of handlers) {
      h({} as Envelope, async () => {}).catch(() => {});
    }
  }

  get id(): string { return this.agentId; }
  get isConnected(): boolean { return this.connected; }
}
