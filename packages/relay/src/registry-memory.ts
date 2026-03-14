/**
 * In-memory agent registry — used by the Node.js relay (Vercel Sandbox / local dev).
 * Satisfies the same interface as the KV-backed AgentRegistry without Cloudflare deps.
 */

import type { AgentCard } from "@aamp/core";
import { createDidWebDocument, type KeyPair, type DIDDocument } from "@aamp/identity";
import type { AgentRegistration } from "./registry.js";

export class MemoryAgentRegistry {
  private byId  = new Map<string, AgentRegistration>();
  private byDid = new Map<string, string>(); // did → agentId

  register(
    agentId: string,
    card: AgentCard,
    keyPair: KeyPair,
    relayPublicUrl: string,
    domain: string,
  ): Promise<AgentRegistration> {
    const didDocument = createDidWebDocument(
      card.did,
      keyPair,
      `${relayPublicUrl}/inbound`,
    );
    return this.registerWithDocument(agentId, card, didDocument);
  }

  registerWithDocument(
    agentId: string,
    card: AgentCard,
    didDocument: DIDDocument,
  ): Promise<AgentRegistration> {
    const reg: AgentRegistration = {
      agentId,
      did:          card.did,
      card,
      didDocument,
      registeredAt: Date.now(),
      lastSeen:     Date.now(),
    };
    this.byId.set(agentId, reg);
    this.byDid.set(card.did, agentId);
    return Promise.resolve(reg);
  }

  get(agentIdOrDid: string): Promise<AgentRegistration | undefined> {
    const byId = this.byId.get(agentIdOrDid);
    if (byId) return Promise.resolve(byId);
    const id = this.byDid.get(agentIdOrDid);
    if (id) return Promise.resolve(this.byId.get(id));
    return Promise.resolve(undefined);
  }

  touch(agentIdOrDid: string): Promise<void> {
    const reg = this.byId.get(agentIdOrDid) ?? this.byId.get(this.byDid.get(agentIdOrDid) ?? "");
    if (reg) reg.lastSeen = Date.now();
    return Promise.resolve();
  }

  list(): Promise<AgentRegistration[]> {
    return Promise.resolve(Array.from(this.byId.values()));
  }

  stale(staleThresholdMs = 60_000): Promise<AgentRegistration[]> {
    const cutoff = Date.now() - staleThresholdMs;
    return Promise.resolve(Array.from(this.byId.values()).filter(r => r.lastSeen < cutoff));
  }
}
