/**
 * Agent registry backed by Cloudflare KV.
 *
 * Replaces the in-memory Map with KV so agent registrations survive
 * across Worker restarts and are shared between all Worker instances.
 *
 * Keys:
 *   agent:id:<agentId>   → JSON AgentRegistration
 *   agent:did:<did>      → agentId string (lookup index)
 */

import type { AgentCard } from "@aamp/core";
import { createDidWebDocument, type KeyPair, type DIDDocument } from "@aamp/identity";

export interface AgentRegistration {
  agentId:      string;
  did:          string;
  card:         AgentCard;
  didDocument:  DIDDocument;
  registeredAt: number;
  lastSeen:     number;
}

/** KV TTL: 24 hours — agents must re-register after restart */
const AGENT_TTL_SECONDS = 86_400;

export class AgentRegistry {
  constructor(private kv: KVNamespace) {}

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

  async registerWithDocument(
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

    const value = JSON.stringify(reg);
    await Promise.all([
      this.kv.put(`agent:id:${agentId}`, value,       { expirationTtl: AGENT_TTL_SECONDS }),
      this.kv.put(`agent:did:${card.did}`, agentId,   { expirationTtl: AGENT_TTL_SECONDS }),
    ]);

    return reg;
  }

  async get(agentIdOrDid: string): Promise<AgentRegistration | undefined> {
    // Try direct lookup by agentId
    const raw = await this.kv.get(`agent:id:${agentIdOrDid}`);
    if (raw) return JSON.parse(raw) as AgentRegistration;

    // Try lookup by DID → agentId
    const agentId = await this.kv.get(`agent:did:${agentIdOrDid}`);
    if (agentId) {
      const raw2 = await this.kv.get(`agent:id:${agentId}`);
      if (raw2) return JSON.parse(raw2) as AgentRegistration;
    }

    return undefined;
  }

  async touch(agentIdOrDid: string): Promise<void> {
    const reg = await this.get(agentIdOrDid);
    if (!reg) return;
    reg.lastSeen = Date.now();
    const value = JSON.stringify(reg);
    await Promise.all([
      this.kv.put(`agent:id:${reg.agentId}`, value,  { expirationTtl: AGENT_TTL_SECONDS }),
      this.kv.put(`agent:did:${reg.did}`, reg.agentId, { expirationTtl: AGENT_TTL_SECONDS }),
    ]);
  }

  async list(): Promise<AgentRegistration[]> {
    const { keys } = await this.kv.list({ prefix: "agent:id:" });
    const results = await Promise.all(
      keys.map(async key => {
        const raw = await this.kv.get(key.name);
        return raw ? (JSON.parse(raw) as AgentRegistration) : null;
      }),
    );
    return results.filter(Boolean) as AgentRegistration[];
  }

  async stale(staleThresholdMs = 60_000): Promise<AgentRegistration[]> {
    const cutoff = Date.now() - staleThresholdMs;
    const all    = await this.list();
    return all.filter(r => r.lastSeen < cutoff);
  }
}
