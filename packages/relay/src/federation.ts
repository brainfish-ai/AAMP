/**
 * Inter-relay federation — the "MTA-to-MTA" hop in AAMP.
 *
 * When an agent sends a message to a recipient on a different domain:
 *   1. Relay A resolves the recipient's DID Document.
 *   2. Reads the AAMPRelay service endpoint (e.g. https://relay.company-b.com/inbound).
 *   3. HTTP POSTs the signed envelope to that endpoint over public internet.
 *   4. Relay B receives it, verifies the signature, and queues it for the recipient.
 *
 * This is the SMTP relay-to-relay handoff model applied to agents.
 * Agents inside sandboxes never need inbound ports — only their relay does.
 */

import type { Envelope } from "@aamp/core";
import { DIDResolver } from "@aamp/identity";

export interface FederationResult {
  success:   boolean;
  error?:    string;
  relayUrl?: string;
}

export class FederationRouter {
  private resolver: DIDResolver;
  private timeout: number;

  constructor(resolver: DIDResolver, timeoutMs = 10_000) {
    this.resolver = resolver;
    this.timeout  = timeoutMs;
  }

  /**
   * Forward an envelope to the target agent's relay via HTTPS.
   * Called when the recipient DID belongs to a different domain.
   */
  async forwardToRemoteRelay(envelope: Envelope): Promise<FederationResult> {
    let relayUrl: string | null;
    try {
      relayUrl = await this.resolver.getRelayEndpoint(envelope.recipientDid);
    } catch (err) {
      return {
        success: false,
        error:   `DID resolution failed for ${envelope.recipientDid}: ${String(err)}`,
      };
    }

    if (!relayUrl) {
      return {
        success: false,
        error:   `No AAMPRelay service endpoint in DID Document for ${envelope.recipientDid}`,
      };
    }

    const inboundUrl = relayUrl.endsWith("/inbound") ? relayUrl : `${relayUrl}/inbound`;

    try {
      const response = await fetch(inboundUrl, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-AAMP-Version":  "0.1.0",
          "X-AAMP-Sender":   envelope.senderDid,
          "X-AAMP-Task-ID":  envelope.taskId,
        },
        body:   JSON.stringify(envelope),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        return {
          success:  false,
          relayUrl: inboundUrl,
          error:    `Remote relay returned HTTP ${response.status}: ${body}`,
        };
      }

      return { success: true, relayUrl: inboundUrl };
    } catch (err) {
      return {
        success:  false,
        relayUrl: inboundUrl,
        error:    `Network error forwarding to ${inboundUrl}: ${String(err)}`,
      };
    }
  }

  /**
   * Determine if a DID belongs to the local relay domain.
   */
  isLocalDid(did: string, domain: string): boolean {
    return (
      did.startsWith(`did:web:${domain}`) ||
      did.startsWith(`did:web:${domain.replace(/\./g, "\\.")}`)
    );
  }
}
