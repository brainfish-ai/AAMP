/**
 * In-memory agent registry.
 *
 * Tracks which agents are currently connected (via NATS subscription or SSE),
 * their Agent Cards, and their DID Documents.
 *
 * In a production deployment this would be backed by a persistent store
 * (Redis, Postgres) — the interface is the same.
 */

import type { AgentCard } from "@aamp/core";
import { createDidWebDocument, type KeyPair, type DIDDocument } from "@aamp/identity";

export interface AgentRegistration {
  agentId:     string;
  did:          string;
  card:         AgentCard;
  didDocument:  DIDDocument;
  registeredAt: number;
  lastSeen:     number;
}

export class AgentRegistry {
  private agents = new Map<string, AgentRegistration>();

  register(
    agentId: string,
    card: AgentCard,
    keyPair: KeyPair,
    relayPublicUrl: string,
    domain: string,
  ): AgentRegistration {
    const did = card.did;
    const didDocument = createDidWebDocument(
      did,
      keyPair,
      `${relayPublicUrl}/inbound`,
    );

    const reg: AgentRegistration = {
      agentId,
      did,
      card,
      didDocument,
      registeredAt: Date.now(),
      lastSeen:     Date.now(),
    };

    this.agents.set(agentId, reg);
    this.agents.set(did, reg);   // index by DID too
    return reg;
  }

  get(agentIdOrDid: string): AgentRegistration | undefined {
    return this.agents.get(agentIdOrDid);
  }

  touch(agentId: string): void {
    const reg = this.agents.get(agentId);
    if (reg) reg.lastSeen = Date.now();
  }

  list(): AgentRegistration[] {
    const seen = new Set<string>();
    const result: AgentRegistration[] = [];
    for (const reg of this.agents.values()) {
      if (!seen.has(reg.agentId)) {
        seen.add(reg.agentId);
        result.push(reg);
      }
    }
    return result;
  }

  /** Agents that haven't sent a heartbeat in > staleThresholdMs */
  stale(staleThresholdMs = 60_000): AgentRegistration[] {
    const cutoff = Date.now() - staleThresholdMs;
    return this.list().filter(r => r.lastSeen < cutoff);
  }
}
