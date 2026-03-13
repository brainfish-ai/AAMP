export { AampAgent } from "./agent.js";
export type { AampAgentOptions, TaskHandler, EventType } from "./agent.js";

// Re-export core types for convenience
export {
  RoutingMode,
  TaskStatus,
  MessageType,
  AAMP_VERSION,
} from "@aamp/core";

export type {
  Envelope,
  AgentCard,
  TaskPayload,
  TaskResult,
  Artifact,
  CapabilityToken,
  ProbeRequest,
  ProbeResponse,
} from "@aamp/core";

// Re-export identity utilities
export {
  generateKeyPair,
  keyPairFromHex,
  createDidKey,
  createDidWeb,
  createDidWebDocument,
  DIDResolver,
  signEnvelope,
  verifyEnvelope,
  issueCapabilityToken,
  verifyCapabilityToken,
  attenuateToken,
} from "@aamp/identity";

export type { KeyPair, DIDDocument } from "@aamp/identity";
