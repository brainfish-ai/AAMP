"""
AAMP Python type definitions — mirrors packages/core/src/types.ts.
"""

from __future__ import annotations
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel

AAMP_VERSION = "0.1.0"


class RoutingMode(str, Enum):
    UNSPECIFIED          = "UNSPECIFIED"
    BLIND_TRANSFER       = "BLIND_TRANSFER"
    SUPERVISED_TRANSFER  = "SUPERVISED_TRANSFER"
    SIDEBAR              = "SIDEBAR"
    CONFERENCE           = "CONFERENCE"
    PASSTHROUGH          = "PASSTHROUGH"


class TaskStatus(str, Enum):
    UNSPECIFIED            = "UNSPECIFIED"
    SUBMITTED              = "SUBMITTED"
    RUNNING                = "RUNNING"
    BLOCKED                = "BLOCKED"
    AWAITING_CONFIRMATION  = "AWAITING_CONFIRMATION"
    COMPLETED              = "COMPLETED"
    FAILED                 = "FAILED"
    CANCELLED              = "CANCELLED"


class MessageType(str, Enum):
    UNSPECIFIED    = "UNSPECIFIED"
    TASK           = "TASK"
    RESPONSE       = "RESPONSE"
    STATUS         = "STATUS"
    PROBE          = "PROBE"
    PROBE_RESPONSE = "PROBE_RESPONSE"
    CONFIRM        = "CONFIRM"
    CANCEL         = "CANCEL"


class Envelope(BaseModel):
    messageId:       str
    senderDid:       str
    recipientDid:    str
    taskId:          str
    parentTaskId:    Optional[str] = None
    rootTaskId:      Optional[str] = None
    replyToMailbox:  Optional[str] = None
    ttlMs:           Optional[int] = None
    routingMode:     RoutingMode   = RoutingMode.SUPERVISED_TRANSFER
    messageType:     MessageType   = MessageType.TASK
    status:          TaskStatus    = TaskStatus.SUBMITTED
    ucanProof:       Optional[str] = None
    signature:       Optional[str] = None
    payload:         Optional[Any] = None
    contentType:     Optional[str] = "application/json"
    metadata:        Optional[dict[str, str]] = None
    createdAt:       int
    aampVersion:     str = AAMP_VERSION


class TaskPayload(BaseModel):
    capabilityId: str
    input:        Any


class Artifact(BaseModel):
    id:          str
    name:        str
    contentType: str
    data:        Optional[str] = None
    url:         Optional[str] = None


class TaskResult(BaseModel):
    success:       bool
    output:        Optional[Any] = None
    errorCode:     Optional[str] = None
    errorMessage:  Optional[str] = None
    artifacts:     list[Artifact] = []


class CostEstimate(BaseModel):
    unit:      str
    maxUnits:  int
    currency:  Optional[str] = None


class ProbeRequest(BaseModel):
    capabilityId: str
    parameters:   Optional[dict[str, str]] = None


class ProbeResponse(BaseModel):
    accepted:             bool
    rejectionReason:      Optional[str] = None
    costEstimate:         Optional[CostEstimate] = None
    estimatedLatencyMs:   Optional[int] = None
    tokenExpiresInMs:     Optional[int] = None


class CapabilityDescriptor(BaseModel):
    id:               str
    name:             str
    description:      str
    inputSchemaUrl:   Optional[str] = None
    outputSchemaUrl:  Optional[str] = None
    estimatedCost:    Optional[CostEstimate] = None


class AgentCard(BaseModel):
    aampVersion:           str = AAMP_VERSION
    did:                   str
    name:                  str
    description:           Optional[str] = None
    endpoint:              str
    mailboxSubject:        str
    capabilities:          list[CapabilityDescriptor] = []
    supportedRoutingModes: list[RoutingMode] = [RoutingMode.BLIND_TRANSFER, RoutingMode.SUPERVISED_TRANSFER]
    authMethods:           list[str] = ["ucan", "did-key"]
    publicKey:             str
    updatedAt:             int
