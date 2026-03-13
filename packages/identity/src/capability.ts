/**
 * AAMP Capability Tokens — a UCAN-inspired scoped authorization mechanism.
 *
 * Why not standard JWTs?
 *   JWT bearer tokens break at async message broker boundaries because:
 *   1. The broker cannot forward authorization context automatically.
 *   2. Bearer tokens allow silent impersonation by any agent in the pipeline.
 *   3. Replay attacks are trivial without binding to a specific interaction.
 *
 * AAMP Capability Tokens fix this by:
 *   - Cryptographically binding the token to a specific (issuer, audience, task) triple.
 *   - Supporting delegation chains: Agent A can issue a token to Agent B that is
 *     provably scoped to what A was authorized to do (attenuation).
 *   - Including a nonce to prevent replay attacks across task boundaries.
 *
 * This is a simplified implementation inspired by UCAN v1.0.
 * Full UCAN spec compatibility is planned for v0.2.0.
 */

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { type CapabilityToken, type TokenCapability } from "@aamp/core";
import { bytesToBase64url, base64urlToBytes } from "./keypair.js";

ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(m[0] ?? new Uint8Array());

// ─────────────────────────────────────────────────────────────
//  Token issuance
// ─────────────────────────────────────────────────────────────

export interface IssueTokenOptions {
  issuerDid:      string;
  audienceDid:    string;
  capabilities:   TokenCapability[];
  /** Token lifetime in seconds (default: 300 = 5 minutes) */
  expiresInSecs?: number;
  /** Parent token IDs for delegation chains */
  proofs?:        string[];
}

/**
 * Issue a capability token signed with the issuer's private key.
 *
 * The token is serialized as: base64url(header).base64url(payload)
 * and signed over those bytes.
 */
export async function issueCapabilityToken(
  opts: IssueTokenOptions,
  issuerPrivateKey: Uint8Array,
): Promise<CapabilityToken> {
  const now         = Math.floor(Date.now() / 1000);
  const expiresIn   = opts.expiresInSecs ?? 300;

  const token: Omit<CapabilityToken, "sig"> = {
    v:   "0.1.0",
    iss: opts.issuerDid,
    aud: opts.audienceDid,
    cap: opts.capabilities,
    exp: now + expiresIn,
    nbf: now,
    nnc: generateNonce(),
    prf: opts.proofs,
  };

  const payload  = bytesToBase64url(new TextEncoder().encode(JSON.stringify(token)));
  const sigBytes = await ed.signAsync(new TextEncoder().encode(payload), issuerPrivateKey);

  return {
    ...token,
    sig: bytesToBase64url(sigBytes),
  };
}

// ─────────────────────────────────────────────────────────────
//  Token verification
// ─────────────────────────────────────────────────────────────

export interface VerifyTokenOptions {
  /** The DID of the agent that will receive/execute the task */
  expectedAudience: string;
  /** The capability that needs to be authorized */
  requiredCapability: TokenCapability;
  /** Public key of the issuer (already resolved — avoids re-resolving) */
  issuerPublicKey: Uint8Array;
}

export interface VerifyTokenResult {
  valid:   boolean;
  reason?: string;
}

export async function verifyCapabilityToken(
  token: CapabilityToken,
  opts: VerifyTokenOptions,
): Promise<VerifyTokenResult> {
  const now = Math.floor(Date.now() / 1000);

  // Check audience
  if (token.aud !== opts.expectedAudience) {
    return { valid: false, reason: `Token audience mismatch: expected ${opts.expectedAudience}, got ${token.aud}` };
  }

  // Check expiry
  if (token.exp < now) {
    return { valid: false, reason: `Token expired at ${new Date(token.exp * 1000).toISOString()}` };
  }

  // Check not-before
  if (token.nbf > now) {
    return { valid: false, reason: `Token not yet valid (nbf: ${new Date(token.nbf * 1000).toISOString()})` };
  }

  // Check capability scope
  const hasCapability = token.cap.some(cap =>
    matchesCapability(cap, opts.requiredCapability)
  );
  if (!hasCapability) {
    return {
      valid: false,
      reason: `Token does not grant capability: ${opts.requiredCapability.ability} on ${opts.requiredCapability.resource}`,
    };
  }

  // Verify signature
  const payload    = bytesToBase64url(new TextEncoder().encode(JSON.stringify({
    v: token.v, iss: token.iss, aud: token.aud, cap: token.cap,
    exp: token.exp, nbf: token.nbf, nnc: token.nnc, prf: token.prf,
  })));
  const sigBytes   = base64urlToBytes(token.sig);
  const msgBytes   = new TextEncoder().encode(payload);

  const valid = await ed.verifyAsync(sigBytes, msgBytes, opts.issuerPublicKey);
  if (!valid) {
    return { valid: false, reason: "Signature verification failed" };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────
//  Delegation (attenuation)
// ─────────────────────────────────────────────────────────────

/**
 * Attenuate a token: create a new token that is equal to or narrower
 * in scope than the parent token. The new token references the parent
 * via the `prf` proof chain field.
 *
 * This is the delegation primitive: Agent A can hand a sub-scoped token
 * to Agent B, which can further delegate to Agent C, with each hop
 * only able to grant what it was granted.
 */
export async function attenuateToken(
  parent: CapabilityToken,
  opts: {
    newAudience:     string;
    capabilities:    TokenCapability[];   // must be subset of parent.cap
    expiresInSecs?:  number;              // must be <= parent.exp
    issuerDid:       string;
    issuerPrivateKey: Uint8Array;
  },
): Promise<CapabilityToken> {
  // Validate that new caps are a subset of parent caps
  for (const cap of opts.capabilities) {
    const allowed = parent.cap.some(parentCap => matchesCapability(parentCap, cap));
    if (!allowed) {
      throw new Error(
        `Cannot delegate capability ${cap.ability} on ${cap.resource}: not present in parent token`
      );
    }
  }

  const parentTokenId = tokenId(parent);

  return issueCapabilityToken(
    {
      issuerDid:    opts.issuerDid,
      audienceDid:  opts.newAudience,
      capabilities: opts.capabilities,
      expiresInSecs: opts.expiresInSecs,
      proofs:       [parentTokenId, ...(parent.prf ?? [])],
    },
    opts.issuerPrivateKey,
  );
}

// ─────────────────────────────────────────────────────────────
//  Serialization
// ─────────────────────────────────────────────────────────────

export function serializeToken(token: CapabilityToken): string {
  return bytesToBase64url(new TextEncoder().encode(JSON.stringify(token)));
}

export function deserializeToken(encoded: string): CapabilityToken {
  return JSON.parse(new TextDecoder().decode(base64urlToBytes(encoded))) as CapabilityToken;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function generateNonce(): string {
  return bytesToBase64url(crypto.getRandomValues(new Uint8Array(16)));
}

/**
 * Determine a stable ID for a token (used in proof chains).
 * We use a base64url of the token's payload (without signature).
 */
function tokenId(token: CapabilityToken): string {
  const { sig: _sig, ...payload } = token;
  return bytesToBase64url(new TextEncoder().encode(JSON.stringify(payload)));
}

/**
 * Check whether a granted capability covers a required capability.
 * Supports wildcards: "aamp/*" covers "aamp/summarize".
 */
function matchesCapability(granted: TokenCapability, required: TokenCapability): boolean {
  const resourceMatch = granted.resource === required.resource || granted.resource === "*";
  const abilityMatch  = granted.ability  === required.ability  ||
                        granted.ability  === "aamp/*"          ||
                        granted.ability  === "*";
  return resourceMatch && abilityMatch;
}
