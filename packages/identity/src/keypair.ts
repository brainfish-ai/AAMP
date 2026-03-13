import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

// noble/ed25519 v2 requires a synchronous SHA-512 to be wired in
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(m[0] ?? new Uint8Array());

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey:  Uint8Array;
}

/** Generate a new random Ed25519 key pair. */
export async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey  = await ed.getPublicKeyAsync(privateKey);
  return { privateKey, publicKey };
}

/** Restore a key pair from a hex-encoded private key string. */
export function keyPairFromHex(privateKeyHex: string): Promise<KeyPair> {
  const privateKey = hexToBytes(privateKeyHex);
  return ed.getPublicKeyAsync(privateKey).then(publicKey => ({ privateKey, publicKey }));
}

// ─────────────────────────────────────────────────────────────
//  Encoding helpers
// ─────────────────────────────────────────────────────────────

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function bytesToBase58(bytes: Uint8Array): string {
  let num = BigInt("0x" + bytesToHex(bytes));
  let result = "";
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % 58n)] + result;
    num = num / 58n;
  }
  for (const byte of bytes) {
    if (byte === 0) result = "1" + result;
    else break;
  }
  return result;
}

export function base58ToBytes(str: string): Uint8Array {
  let num = 0n;
  for (const char of str) {
    const idx = BASE58_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base58 character: ${char}`);
    num = num * 58n + BigInt(idx);
  }
  const hex = num.toString(16).padStart(2, "0");
  const bytes = hexToBytes(hex.length % 2 ? "0" + hex : hex);
  const leadingZeros = [...str].filter(c => c === "1").length;
  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2) hex = "0" + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToBase64url(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function base64urlToBytes(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return new Uint8Array(Buffer.from(padded, "base64"));
}

/** Encode public key as multibase base58btc (z-prefix) */
export function publicKeyToMultibase(publicKey: Uint8Array): string {
  // Multicodec prefix for Ed25519 public key: 0xed01
  const prefixed = new Uint8Array([0xed, 0x01, ...publicKey]);
  return "z" + bytesToBase58(prefixed);
}

export function multibaseToPublicKey(multibase: string): Uint8Array {
  if (!multibase.startsWith("z")) throw new Error("Only base58btc (z-prefix) multibase supported");
  const bytes = base58ToBytes(multibase.slice(1));
  // Skip the 2-byte multicodec prefix (0xed, 0x01)
  return bytes.slice(2);
}

export { ed };
