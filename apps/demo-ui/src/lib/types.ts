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
  | "probing"
  | "probe_sent"       // Finance → Relay A
  | "probe_federated"  // Relay A → Relay B
  | "probe_delivered"  // Relay B → Research Bot
  | "probe_response"   // Research Bot → Relay B → Relay A → Finance
  | "task_sent"        // Finance → Relay A
  | "task_federated"   // Relay A → Relay B
  | "task_delivered"   // Relay B → Research Bot
  | "task_processing"  // Research Bot working
  | "task_response"    // Research Bot → ... → Finance
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
