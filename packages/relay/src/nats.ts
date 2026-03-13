/**
 * NATS JetStream setup for the AAMP relay.
 *
 * Subject namespace:
 *   aamp.<domain>.<agentId>.inbox   — per-agent durable inbox (WorkQueue stream)
 *   aamp.<domain>.<agentId>.status  — ephemeral status/heartbeat updates
 *   aamp.events                     — broadcast stream for task lifecycle events
 *
 * The WorkQueue retention policy means a message is deleted from the stream
 * as soon as one consumer ACKs it — natural task queue semantics.
 */

import {
  connect,
  type NatsConnection,
  type JetStreamManager,
  type JetStreamClient,
  AckPolicy,
  RetentionPolicy,
  StorageType,
} from "nats";
import type { RelayConfig } from "./config.js";

export interface NatsContext {
  nc:  NatsConnection;
  jsm: JetStreamManager;
  js:  JetStreamClient;
}

export async function connectNats(config: RelayConfig): Promise<NatsContext> {
  const nc  = await connect({ servers: config.natsUrl });
  const jsm = await nc.jetstreamManager();
  const js  = nc.jetstream();

  await ensureStream(jsm, config);

  console.log(`[nats] Connected to ${config.natsUrl}`);
  return { nc, jsm, js };
}

/**
 * Ensure the main AAMP_MESSAGES stream exists.
 * If it already exists (e.g. relay restart), this is a no-op.
 */
async function ensureStream(jsm: JetStreamManager, config: RelayConfig): Promise<void> {
  const subjects = [`aamp.${config.domain}.*.inbox`];

  try {
    await jsm.streams.info(config.streamName);
    console.log(`[nats] Stream ${config.streamName} already exists`);
  } catch {
    await jsm.streams.add({
      name:         config.streamName,
      subjects,
      retention:    RetentionPolicy.Workqueue,   // delete on ACK
      storage:      StorageType.File,            // persist to disk
      max_age:      config.maxTtlMs * 1_000_000, // nanoseconds
      max_msg_size: 4 * 1024 * 1024,             // 4 MB max per message
      duplicate_window: 60_000_000_000,          // 60-second deduplication window (ns)
      num_replicas: 1,                           // increase for HA cluster
    });
    console.log(`[nats] Created stream ${config.streamName} for subjects: ${subjects.join(", ")}`);
  }
}

/**
 * Ensure a durable push consumer exists for a given agent.
 * The consumer delivers messages pushed to the agent's inbox subject.
 */
export async function ensureAgentConsumer(
  jsm: JetStreamManager,
  config: RelayConfig,
  agentId: string,
): Promise<void> {
  const consumerName = `agent-${agentId}`;
  const filterSubject = `aamp.${config.domain}.${agentId}.inbox`;

  try {
    await jsm.consumers.info(config.streamName, consumerName);
  } catch {
    await jsm.consumers.add(config.streamName, {
      durable_name:    consumerName,
      filter_subject:  filterSubject,
      ack_policy:      AckPolicy.Explicit,
      max_deliver:     5,                        // retry up to 5 times before DLQ
      ack_wait:        30_000_000_000,           // 30 seconds (nanoseconds)
    });
    console.log(`[nats] Created consumer ${consumerName} for ${filterSubject}`);
  }
}

/**
 * Pull and return any messages pending in the agent's durable JetStream consumer.
 * Called when a new SSE connection opens so missed messages are replayed immediately.
 * Uses nats.js v2 JetStreamClient.fetch() API.
 */
export async function drainAgentMailbox(
  js:      JetStreamClient,
  config:  RelayConfig,
  agentId: string,
): Promise<string[]> {
  const consumerName = `agent-${agentId}`;
  const results: string[] = [];
  try {
    // Check if consumer has pending messages first
    const iter = js.fetch(config.streamName, consumerName, {
      batch:   50,
      expires: 500,  // 500 ms timeout
    });
    for await (const msg of iter) {
      results.push(new TextDecoder().decode(msg.data));
      msg.ack();
    }
  } catch {
    // Consumer may not exist yet or stream empty — non-fatal
  }
  return results;
}

/**
 * Publish an envelope to an agent's inbox subject.
 */
export async function publishToMailbox(
  js: JetStreamClient,
  domain: string,
  agentId: string,
  payload: Uint8Array,
  messageId: string,
): Promise<void> {
  const subject = `aamp.${domain}.${agentId}.inbox`;
  await js.publish(subject, payload, {
    msgID: messageId,         // NATS deduplication key
  });
}

/**
 * Extract agentId from a DID for local routing.
 * Only works for DIDs managed by this relay's domain.
 *
 * did:web:acme.com:agents:finance-01  →  "finance-01"
 * did:key:z6Mk...                     →  last 8 chars of multibase key
 */
export function agentIdFromDid(did: string, domain: string): string | null {
  if (did.startsWith(`did:web:${domain}`)) {
    const parts = did.split(":");
    return parts[parts.length - 1];
  }
  if (did.startsWith("did:key:")) {
    const key = did.slice("did:key:".length);
    return key.slice(-12);  // short stable identifier for local routing
  }
  return null;
}
