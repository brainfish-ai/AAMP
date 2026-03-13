/**
 * DID (Decentralized Identifier) creation and resolution.
 *
 * Supported methods:
 *   did:key  — deterministically derived from an Ed25519 public key.
 *              Self-contained, no network needed. Best for ephemeral agents.
 *   did:web  — hosted at a well-known HTTPS URL.
 *              Best for persistent, organizational agent identities.
 *
 * DID Documents are the "MX record" equivalent in AAMP federation:
 * the relay reads the `service.serviceEndpoint` to know which relay to
 * POST the inter-company message to.
 */

import { publicKeyToMultibase, multibaseToPublicKey, KeyPair } from "./keypair.js";

// ─────────────────────────────────────────────────────────────
//  DID Document types (W3C DID v1.1 compatible)
// ─────────────────────────────────────────────────────────────

export interface VerificationMethod {
  id:                 string;
  type:               string;
  controller:         string;
  publicKeyMultibase: string;
}

export interface ServiceEndpoint {
  id:              string;
  type:            string;
  serviceEndpoint: string;
}

export interface DIDDocument {
  "@context":           string[];
  id:                   string;
  verificationMethod:   VerificationMethod[];
  authentication:       string[];
  assertionMethod:      string[];
  service?:             ServiceEndpoint[];
}

// ─────────────────────────────────────────────────────────────
//  did:key — derive DID from Ed25519 public key
// ─────────────────────────────────────────────────────────────

/**
 * Create a did:key DID from an Ed25519 public key.
 * Format: did:key:z<base58btc-encoded-multicodec-public-key>
 */
export function createDidKey(publicKey: Uint8Array): string {
  const multibase = publicKeyToMultibase(publicKey);
  return `did:key:${multibase}`;
}

/**
 * Resolve a did:key DID to its DID Document.
 * No network call required — entirely deterministic.
 */
export function resolveDidKey(did: string): DIDDocument {
  if (!did.startsWith("did:key:")) throw new Error(`Not a did:key DID: ${did}`);

  const multibase = did.slice("did:key:".length);
  const keyId = `${did}#${multibase}`;

  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    id: did,
    verificationMethod: [
      {
        id:                 keyId,
        type:               "Ed25519VerificationKey2020",
        controller:         did,
        publicKeyMultibase: multibase,
      },
    ],
    authentication:  [keyId],
    assertionMethod: [keyId],
  };
}

// ─────────────────────────────────────────────────────────────
//  did:web — derive DID from domain + path
// ─────────────────────────────────────────────────────────────

/**
 * Create a did:web DID.
 * - Domain only:    did:web:example.com      → https://example.com/.well-known/did.json
 * - With path:      did:web:example.com:agents:finance-01
 *                   → https://example.com/agents/finance-01/did.json
 */
export function createDidWeb(domain: string, path?: string): string {
  if (!path) return `did:web:${domain}`;
  const encoded = path.replace(/\//g, ":");
  return `did:web:${domain}:${encoded}`;
}

/**
 * Build the well-known URL for a did:web DID document.
 */
export function didWebToUrl(did: string): string {
  if (!did.startsWith("did:web:")) throw new Error(`Not a did:web DID: ${did}`);
  const remainder = did.slice("did:web:".length);
  const parts = remainder.split(":");
  const domain = parts[0];
  if (parts.length === 1) {
    return `https://${domain}/.well-known/did.json`;
  }
  const path = parts.slice(1).join("/");
  return `https://${domain}/${path}/did.json`;
}

/**
 * Generate a did:web DID Document from a key pair and relay endpoint.
 * The relay should host this at the well-known URL.
 */
export function createDidWebDocument(
  did: string,
  keyPair: KeyPair,
  relayInboundUrl: string,
): DIDDocument {
  const multibase = publicKeyToMultibase(keyPair.publicKey);
  const keyId = `${did}#key-1`;

  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    id: did,
    verificationMethod: [
      {
        id:                 keyId,
        type:               "Ed25519VerificationKey2020",
        controller:         did,
        publicKeyMultibase: multibase,
      },
    ],
    authentication:  [keyId],
    assertionMethod: [keyId],
    service: [
      {
        id:              `${did}#aamp-relay`,
        type:            "AAMPRelay",
        serviceEndpoint: relayInboundUrl,
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────
//  DID Resolver — with in-memory cache
// ─────────────────────────────────────────────────────────────

interface CacheEntry {
  document:  DIDDocument;
  fetchedAt: number;
}

export class DIDResolver {
  private cache = new Map<string, CacheEntry>();
  private ttlMs: number;

  constructor(options: { cacheTtlMs?: number } = {}) {
    this.ttlMs = options.cacheTtlMs ?? 5 * 60 * 1000; // 5 minutes default
  }

  async resolve(did: string): Promise<DIDDocument> {
    const cached = this.cache.get(did);
    if (cached && Date.now() - cached.fetchedAt < this.ttlMs) {
      return cached.document;
    }

    let document: DIDDocument;

    if (did.startsWith("did:key:")) {
      document = resolveDidKey(did);
    } else if (did.startsWith("did:web:")) {
      document = await this.fetchDidWeb(did);
    } else {
      throw new Error(`Unsupported DID method: ${did}`);
    }

    this.cache.set(did, { document, fetchedAt: Date.now() });
    return document;
  }

  /** Extract the first Ed25519 public key from a DID Document. */
  async getPublicKey(did: string): Promise<Uint8Array> {
    const doc = await this.resolve(did);
    const vm = doc.verificationMethod[0];
    if (!vm?.publicKeyMultibase) throw new Error(`No public key found in DID Document for ${did}`);
    return multibaseToPublicKey(vm.publicKeyMultibase);
  }

  /** Extract the AAMP relay inbound URL for federation routing. */
  async getRelayEndpoint(did: string): Promise<string | null> {
    const doc = await this.resolve(did);
    const service = doc.service?.find(s => s.type === "AAMPRelay");
    return service?.serviceEndpoint ?? null;
  }

  private async fetchDidWeb(did: string): Promise<DIDDocument> {
    const url = didWebToUrl(did);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch DID Document for ${did}: HTTP ${response.status}`);
    }
    return response.json() as Promise<DIDDocument>;
  }

  /** Manually register a DID Document (useful for local/test environments). */
  register(did: string, document: DIDDocument): void {
    this.cache.set(did, { document, fetchedAt: Date.now() });
  }

  invalidate(did: string): void {
    this.cache.delete(did);
  }
}
