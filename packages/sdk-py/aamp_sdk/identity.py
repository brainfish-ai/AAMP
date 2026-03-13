"""
AAMP Python identity layer: Ed25519 keypairs, DID creation, envelope signing.
"""

from __future__ import annotations
import base64
import hashlib
import json
import os
import secrets
import time
from typing import Optional

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives.serialization import (
    Encoding,
    PublicFormat,
    PrivateFormat,
    NoEncryption,
)

from .types import Envelope, AAMP_VERSION

# ─────────────────────────────────────────────────────────────
#  Encoding helpers
# ─────────────────────────────────────────────────────────────

BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def bytes_to_base58(data: bytes) -> str:
    num = int.from_bytes(data, "big")
    result = ""
    while num > 0:
        num, remainder = divmod(num, 58)
        result = BASE58_ALPHABET[remainder] + result
    for byte in data:
        if byte == 0:
            result = "1" + result
        else:
            break
    return result


def bytes_to_base64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def base64url_to_bytes(s: str) -> bytes:
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


# ─────────────────────────────────────────────────────────────
#  Key pair
# ─────────────────────────────────────────────────────────────

class KeyPair:
    def __init__(self, private_key: Ed25519PrivateKey):
        self._private = private_key
        self._public  = private_key.public_key()

    @classmethod
    def generate(cls) -> "KeyPair":
        return cls(Ed25519PrivateKey.generate())

    @classmethod
    def from_bytes(cls, private_key_bytes: bytes) -> "KeyPair":
        return cls(Ed25519PrivateKey.from_private_bytes(private_key_bytes))

    @property
    def private_bytes(self) -> bytes:
        return self._private.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())

    @property
    def public_bytes(self) -> bytes:
        return self._public.public_bytes(Encoding.Raw, PublicFormat.Raw)

    @property
    def public_key_multibase(self) -> str:
        """Multibase base58btc with Ed25519 multicodec prefix (0xed01)."""
        prefixed = bytes([0xed, 0x01]) + self.public_bytes
        return "z" + bytes_to_base58(prefixed)

    def sign(self, message: bytes) -> bytes:
        return self._private.sign(message)

    def verify(self, signature: bytes, message: bytes) -> bool:
        try:
            self._public.verify(signature, message)
            return True
        except Exception:
            return False


# ─────────────────────────────────────────────────────────────
#  DID creation
# ─────────────────────────────────────────────────────────────

def create_did_key(keypair: KeyPair) -> str:
    return f"did:key:{keypair.public_key_multibase}"


def create_did_web(domain: str, path: Optional[str] = None) -> str:
    if not path:
        return f"did:web:{domain}"
    encoded = path.replace("/", ":")
    return f"did:web:{domain}:{encoded}"


def create_did_web_document(did: str, keypair: KeyPair, relay_inbound_url: str) -> dict:
    key_id = f"{did}#key-1"
    return {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2020/v1",
        ],
        "id": did,
        "verificationMethod": [{
            "id":                 key_id,
            "type":               "Ed25519VerificationKey2020",
            "controller":         did,
            "publicKeyMultibase": keypair.public_key_multibase,
        }],
        "authentication":  [key_id],
        "assertionMethod": [key_id],
        "service": [{
            "id":              f"{did}#aamp-relay",
            "type":            "AAMPRelay",
            "serviceEndpoint": relay_inbound_url,
        }],
    }


# ─────────────────────────────────────────────────────────────
#  Envelope signing
# ─────────────────────────────────────────────────────────────

def _canonicalize_for_signing(envelope: Envelope) -> bytes:
    """Produce canonical bytes for signing (mirrors TypeScript implementation)."""
    fields = {
        "messageId":      envelope.messageId,
        "senderDid":      envelope.senderDid,
        "recipientDid":   envelope.recipientDid,
        "taskId":         envelope.taskId,
        "parentTaskId":   envelope.parentTaskId or "",
        "rootTaskId":     envelope.rootTaskId or "",
        "replyToMailbox": envelope.replyToMailbox or "",
        "ttlMs":          envelope.ttlMs or 0,
        "routingMode":    envelope.routingMode.value,
        "messageType":    envelope.messageType.value,
        "status":         envelope.status.value,
        "ucanProof":      envelope.ucanProof or "",
        "createdAt":      envelope.createdAt,
        "aampVersion":    envelope.aampVersion,
    }
    return json.dumps(fields, separators=(",", ":"), sort_keys=False).encode()


def sign_envelope(envelope: Envelope, keypair: KeyPair) -> Envelope:
    """Sign an envelope with the agent's private key. Returns envelope with signature set."""
    message = _canonicalize_for_signing(envelope)
    sig_bytes = keypair.sign(message)
    return envelope.model_copy(update={"signature": bytes_to_base64url(sig_bytes)})


def verify_envelope(envelope: Envelope, public_key_bytes: bytes) -> bool:
    """Verify an envelope's signature against a known Ed25519 public key."""
    if not envelope.signature:
        raise ValueError("Envelope has no signature")
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    pub = Ed25519PublicKey.from_public_bytes(public_key_bytes)
    sig = base64url_to_bytes(envelope.signature)
    message = _canonicalize_for_signing(envelope.model_copy(update={"signature": None}))
    try:
        pub.verify(sig, message)
        return True
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────
#  Capability tokens
# ─────────────────────────────────────────────────────────────

def issue_capability_token(
    issuer_did: str,
    audience_did: str,
    capabilities: list[dict],
    keypair: KeyPair,
    expires_in_secs: int = 300,
) -> dict:
    now = int(time.time())
    token_payload = {
        "v":   "0.1.0",
        "iss": issuer_did,
        "aud": audience_did,
        "cap": capabilities,
        "exp": now + expires_in_secs,
        "nbf": now,
        "nnc": bytes_to_base64url(secrets.token_bytes(16)),
    }
    payload_bytes = json.dumps(token_payload, separators=(",", ":")).encode()
    payload_b64   = bytes_to_base64url(payload_bytes)
    sig_bytes     = keypair.sign(payload_b64.encode())
    return {**token_payload, "sig": bytes_to_base64url(sig_bytes)}
