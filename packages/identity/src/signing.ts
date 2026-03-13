/**
 * AAMP Envelope signing and verification using Ed25519.
 *
 * Every AAMP message envelope is signed by the sender's private key.
 * Receivers verify the signature using the sender's public key, obtained
 * by resolving the sender's DID Document.
 *
 * Signed surface: all envelope fields except `signature` itself, serialized
 * as a canonical JSON string (deterministic key order via canonicalizeForSigning).
 */

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { type Envelope, canonicalizeForSigning } from "@aamp/core";
import { bytesToBase64url, base64urlToBytes } from "./keypair.js";
import { DIDResolver } from "./did.js";

ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(m[0] ?? new Uint8Array());

/**
 * Sign an envelope with the sender's Ed25519 private key.
 * Returns the envelope with the `signature` field populated.
 */
export async function signEnvelope(
  envelope: Omit<Envelope, "signature">,
  privateKey: Uint8Array,
): Promise<Envelope> {
  const message   = canonicalizeForSigning(envelope);
  const sigBytes  = await ed.signAsync(message, privateKey);
  return {
    ...envelope,
    signature: bytesToBase64url(sigBytes),
  };
}

/**
 * Verify an envelope's Ed25519 signature.
 * Resolves the sender's DID to obtain their public key.
 *
 * @throws if the signature is missing, malformed, or invalid.
 */
export async function verifyEnvelope(
  envelope: Envelope,
  resolver: DIDResolver,
): Promise<boolean> {
  if (!envelope.signature) throw new Error("Envelope has no signature");

  const publicKey = await resolver.getPublicKey(envelope.senderDid);
  const sigBytes  = base64urlToBytes(envelope.signature);

  const { signature: _sig, ...rest } = envelope;
  const message = canonicalizeForSigning(rest);

  return ed.verifyAsync(sigBytes, message, publicKey);
}

/**
 * Quick verify using a known public key bytes (avoids DID resolution — useful
 * for the relay after it has already resolved and cached the public key).
 */
export async function verifyWithPublicKey(
  envelope: Envelope,
  publicKey: Uint8Array,
): Promise<boolean> {
  if (!envelope.signature) throw new Error("Envelope has no signature");

  const sigBytes = base64urlToBytes(envelope.signature);
  const { signature: _sig, ...rest } = envelope;
  const message = canonicalizeForSigning(rest);

  return ed.verifyAsync(sigBytes, message, publicKey);
}
