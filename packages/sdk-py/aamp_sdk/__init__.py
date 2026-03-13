"""
AAMP Python SDK — Agent-to-Agent Messaging Protocol client.

Quick start:
    from aamp_sdk import AampAgent
    from aamp_sdk.identity import KeyPair, create_did_key
    from aamp_sdk.types import TaskStatus, RoutingMode
"""

from .agent import AampAgent
from .identity import KeyPair, create_did_key, create_did_web, sign_envelope, verify_envelope
from .types import (
    Envelope,
    AgentCard,
    TaskPayload,
    TaskResult,
    TaskStatus,
    MessageType,
    RoutingMode,
    AAMP_VERSION,
)

__version__ = AAMP_VERSION
__all__ = [
    "AampAgent",
    "KeyPair",
    "create_did_key",
    "create_did_web",
    "sign_envelope",
    "verify_envelope",
    "Envelope",
    "AgentCard",
    "TaskPayload",
    "TaskResult",
    "TaskStatus",
    "MessageType",
    "RoutingMode",
    "AAMP_VERSION",
]
