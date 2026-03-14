/**
 * Relay server configuration — driven by Cloudflare Worker environment bindings.
 * All values are read per-request from the Worker `env` object.
 */

export interface WorkerEnv {
  /** Cloudflare KV namespace for agent registry */
  KV_AGENTS: KVNamespace;
  /** NATS server WebSocket URL (e.g. wss://connect.ngs.global) */
  NATS_URL: string;
  /** NKey seed credentials from Synadia Cloud (optional for open servers) */
  NATS_CREDS?: string;
  /** Domain this relay is authoritative for */
  RELAY_DOMAIN?: string;
  /** This relay's public HTTPS URL (used in DID Documents) */
  RELAY_PUBLIC_URL?: string;
  /** Maximum message TTL in milliseconds (default: 24 hours) */
  RELAY_MAX_TTL_MS?: string;
  /** JetStream stream name for the durable agent inbox */
  RELAY_STREAM_NAME?: string;
  /** "true" to hard-reject messages with invalid signatures */
  RELAY_STRICT_AUTH?: string;
}

export interface RelayConfig {
  natsUrl:                string;
  natsCreds?:             string;
  publicUrl:              string;
  domain:                 string;
  maxTtlMs:               number;
  streamName:             string;
  requireCapabilityProof: boolean;
  strictAuth:             boolean;
}

export function loadConfig(env: WorkerEnv): RelayConfig {
  return {
    natsUrl:               env.NATS_URL ?? "wss://localhost:4222",
    natsCreds:             env.NATS_CREDS,
    publicUrl:             env.RELAY_PUBLIC_URL ?? "http://localhost:8080",
    domain:                env.RELAY_DOMAIN ?? "localhost",
    maxTtlMs:              parseInt(env.RELAY_MAX_TTL_MS ?? String(24 * 60 * 60 * 1000), 10),
    streamName:            env.RELAY_STREAM_NAME ?? "AAMP_MESSAGES",
    requireCapabilityProof: false,
    strictAuth:            env.RELAY_STRICT_AUTH === "true",
  };
}
