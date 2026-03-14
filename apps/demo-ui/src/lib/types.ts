// ─── AAMP message types mirrored for the UI ──────────────────────────────────

export type MessageType =
  | "TASK"
  | "RESPONSE"
  | "STATUS"
  | "PROBE"
  | "PROBE_RESPONSE"
  | "CONFIRM"
  | "CANCEL";

export type TaskStatus =
  | "SUBMITTED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface Envelope {
  messageId:      string;
  senderDid:      string;
  recipientDid:   string;
  taskId:         string;
  parentTaskId?:  string;
  rootTaskId?:    string;
  replyToMailbox?: string;
  ttlMs?:         number;
  routingMode?:   string;
  messageType:    MessageType;
  status?:        TaskStatus;
  ucanProof?:     string;
  signature?:     string;
  payload?:       unknown;
  contentType?:   string;
  metadata?:      Record<string, string>;
  createdAt:      number;
  aampVersion?:   string;
}

// ─── UI-specific types ────────────────────────────────────────────────────────

export type FlowStep =
  | "idle"
  | "registering"
  // ── Phase 1: Finance ↔ Research (Cloudflare A ↔ Cloudflare B) ──
  | "probing"
  | "probe_sent"
  | "probe_federated"
  | "probe_delivered"
  | "probe_response"
  | "task_sent"
  | "task_federated"
  | "task_delivered"
  | "task_processing"
  | "task_response"
  | "research_done"
  // ── Phase 2: Finance → Compliance (Cloudflare A → Vercel Sandbox C) ──
  | "compliance_probing"
  | "compliance_probe_response"
  | "compliance_task_sent"
  | "compliance_processing"
  | "compliance_done"
  // ── Terminal ──
  | "completed"
  | "error";

export interface LogEntry {
  id:          string;
  timestamp:   number;
  type:        MessageType | "SYSTEM" | "ERROR";
  from:        string;
  to:          string;
  taskId?:     string;
  messageId?:  string;
  payload?:    unknown;
  label:       string;
  step?:       FlowStep;
}

export interface AgentState {
  did:         string;
  agentId:     string;
  connected:   boolean;
  relay:       string;
  domain:      string;
}

export interface RelayHealth {
  status:  "ok" | "error" | "checking";
  domain?: string;
  uptime?: number;
}
