/**
 * Relay server configuration — driven by environment variables.
 * All configuration is read at startup; the server must be restarted to pick up changes.
 */

export interface RelayConfig {
  /** HTTP server listen port */
  httpPort: number;
  /** NATS server URL (e.g. nats://localhost:4222) */
  natsUrl: string;
  /** This relay's public HTTPS URL (used in DID Documents it serves) */
  publicUrl: string;
  /** Domain this relay is authoritative for (e.g. "acme.com") */
  domain: string;
  /** Maximum message TTL in milliseconds (default: 24 hours) */
  maxTtlMs: number;
  /** JetStream stream name for the durable agent inbox */
  streamName: string;
  /** Whether to require UCAN capability proofs on all messages */
  requireCapabilityProof: boolean;
}

export function loadConfig(): RelayConfig {
  return {
    httpPort:              parseInt(process.env.RELAY_PORT ?? "8080", 10),
    natsUrl:               process.env.NATS_URL ?? "nats://localhost:4222",
    publicUrl:             process.env.RELAY_PUBLIC_URL ?? "http://localhost:8080",
    domain:                process.env.RELAY_DOMAIN ?? "localhost",
    maxTtlMs:              parseInt(process.env.RELAY_MAX_TTL_MS ?? String(24 * 60 * 60 * 1000), 10),
    streamName:            process.env.RELAY_STREAM_NAME ?? "AAMP_MESSAGES",
    requireCapabilityProof: process.env.RELAY_REQUIRE_CAPABILITY_PROOF === "true",
  };
}
