/**
 * TypeScript mirror of the canonical Protobuf schema (packages/core/proto/aamp.proto).
 * These types are used across all AAMP packages and are the source of truth for
 * runtime serialization until full buf code-gen is wired in Month 2.
 */

export const AAMP_VERSION = "0.1.0" as const;

// ─────────────────────────────────────────────────────────────
//  Enumerations
// ─────────────────────────────────────────────────────────────

export enum RoutingMode {
  UNSPECIFIED          = "UNSPECIFIED",
  BLIND_TRANSFER       = "BLIND_TRANSFER",
  SUPERVISED_TRANSFER  = "SUPERVISED_TRANSFER",
  SIDEBAR              = "SIDEBAR",
  CONFERENCE           = "CONFERENCE",
  PASSTHROUGH          = "PASSTHROUGH",
}

export enum TaskStatus {
  UNSPECIFIED            = "UNSPECIFIED",
  SUBMITTED              = "SUBMITTED",
  RUNNING                = "RUNNING",
  BLOCKED                = "BLOCKED",
  AWAITING_CONFIRMATION  = "AWAITING_CONFIRMATION",
  COMPLETED              = "COMPLETED",
  FAILED                 = "FAILED",
  CANCELLED              = "CANCELLED",
}

export enum MessageType {
  UNSPECIFIED    = "UNSPECIFIED",
  TASK           = "TASK",
  RESPONSE       = "RESPONSE",
  STATUS         = "STATUS",
  PROBE          = "PROBE",
  PROBE_RESPONSE = "PROBE_RESPONSE",
  CONFIRM        = "CONFIRM",
  CANCEL         = "CANCEL",
}

// ─────────────────────────────────────────────────────────────
//  The AAMP Envelope
// ─────────────────────────────────────────────────────────────

export interface Envelope {
  // Identity
  messageId:    string;   // UUID v7
  senderDid:    string;   // e.g. "did:key:z6Mk..." or "did:web:acme.com/agents/finance-01"
  recipientDid: string;

  // Task threading
  taskId:       string;
  parentTaskId?: string;
  rootTaskId?:  string;

  // Routing
  replyToMailbox?: string;  // NATS subject or HTTP callback URL
  ttlMs?:          number;  // 0 = no expiry
  routingMode:     RoutingMode;
  messageType:     MessageType;
  status:          TaskStatus;

  // Security
  ucanProof?: string;   // base64url-encoded UCAN capability token
  signature?: string;   // base64url-encoded Ed25519 signature

  // Content
  payload?:     unknown;  // deserialized payload object
  contentType?: string;   // "application/json" | "application/protobuf"

  // Metadata
  metadata?:    Record<string, string>;
  createdAt:    number;   // Unix milliseconds
  aampVersion:  string;   // "0.1.0"
}

// ─────────────────────────────────────────────────────────────
//  Capability Negotiation
// ─────────────────────────────────────────────────────────────

export interface ProbeRequest {
  capabilityId: string;
  parameters?:  Record<string, string>;
}

export interface CostEstimate {
  unit:      string;   // "tokens" | "usd" | "compute-seconds"
  maxUnits:  number;
  currency?: string;   // ISO 4217 if unit == "usd"
}

export interface ProbeResponse {
  accepted:              boolean;
  rejectionReason?:      string;
  costEstimate?:         CostEstimate;
  estimatedLatencyMs?:   number;
  tokenExpiresInMs?:     number;
}

// ─────────────────────────────────────────────────────────────
//  Task Payloads
// ─────────────────────────────────────────────────────────────

export interface TaskPayload {
  capabilityId: string;
  input:        unknown;
}

export interface Artifact {
  id:          string;
  name:        string;
  contentType: string;
  data?:       string;  // base64-encoded for inline artifacts
  url?:        string;  // remote URL for large artifacts
}

export interface TaskResult {
  success:       boolean;
  output?:       unknown;
  errorCode?:    string;
  errorMessage?: string;
  artifacts?:    Artifact[];
}

export interface StatusUpdate {
  status:           TaskStatus;
  message?:         string;
  progressPercent?: number;  // 0–100
}

// ─────────────────────────────────────────────────────────────
//  Agent Card — discovery document
// ─────────────────────────────────────────────────────────────

export interface CapabilityDescriptor {
  id:               string;
  name:             string;
  description:      string;
  inputSchemaUrl?:  string;
  outputSchemaUrl?: string;
  estimatedCost?:   CostEstimate;
}

export interface AgentCard {
  aampVersion:           string;
  did:                   string;
  name:                  string;
  description?:          string;
  endpoint:              string;          // HTTPS base URL of agent's relay endpoint
  mailboxSubject:        string;          // NATS subject pattern (e.g. aamp.acme.finance-01.inbox)
  capabilities:          CapabilityDescriptor[];
  supportedRoutingModes: RoutingMode[];
  authMethods:           string[];        // ["ucan", "did-key"]
  publicKey:             string;          // multibase-encoded Ed25519 public key
  updatedAt:             number;          // Unix milliseconds
}

// ─────────────────────────────────────────────────────────────
//  UCAN-inspired Capability Token
// ─────────────────────────────────────────────────────────────

export interface CapabilityToken {
  v:    string;          // "0.1.0" — token spec version
  iss:  string;          // issuer DID (who grants)
  aud:  string;          // audience DID (who receives the grant)
  cap:  TokenCapability[];
  exp:  number;          // expiry — Unix seconds
  nbf:  number;          // not-before — Unix seconds
  nnc:  string;          // nonce — prevents replay attacks
  prf?: string[];        // proof chain — parent token IDs for delegation
  sig:  string;          // base64url Ed25519 signature over header.payload
}

export interface TokenCapability {
  resource: string;   // e.g. "aamp:agent:did:web:acme.com/agents/research-bot"
  ability:  string;   // e.g. "aamp/summarize" or "aamp/*"
}

// ─────────────────────────────────────────────────────────────
//  Wire serialization helpers
// ─────────────────────────────────────────────────────────────

/** Produces the canonical byte representation of an envelope for signing.
 *  Only fields that are part of the signed surface are included.
 */
export function canonicalizeForSigning(env: Omit<Envelope, "signature">): Uint8Array {
  const fields = {
    messageId:      env.messageId,
    senderDid:      env.senderDid,
    recipientDid:   env.recipientDid,
    taskId:         env.taskId,
    parentTaskId:   env.parentTaskId ?? "",
    rootTaskId:     env.rootTaskId ?? "",
    replyToMailbox: env.replyToMailbox ?? "",
    ttlMs:          env.ttlMs ?? 0,
    routingMode:    env.routingMode,
    messageType:    env.messageType,
    status:         env.status,
    ucanProof:      env.ucanProof ?? "",
    createdAt:      env.createdAt,
    aampVersion:    env.aampVersion,
  };
  return new TextEncoder().encode(JSON.stringify(fields));
}
