# RFC-0001: Agent-to-Agent Messaging Protocol (AAMP) v0.1.0

**Status:** DRAFT  
**Authors:** AAMP Working Group  
**Created:** 2026-03-13  
**Updated:** 2026-03-13  

---

## Abstract

This document specifies the Agent-to-Agent Messaging Protocol (AAMP), a federated, asynchronous, cryptographically-authenticated protocol for communication between autonomous AI agents operating across different organizational boundaries, sandbox environments, and infrastructure providers.

AAMP is transport-agnostic, supports long-lived stateful tasks, and includes first-class primitives for agent identity (via Decentralized Identifiers), capability-scoped authorization (via UCAN-inspired tokens), and federated message routing (via store-and-forward relay networks analogous to SMTP Mail Transfer Agents).

---

## 1. Motivation and Problem Statement

### 1.1 The Fragmentation Problem

The current AI agent ecosystem suffers from a fundamental communication problem: agents built by different companies, using different frameworks, running in different sandboxed environments, cannot reliably exchange tasks, state, or results. Existing protocols either solve only a narrow part of the problem or introduce unacceptable centralization.

### 1.2 Why Existing Protocols Are Insufficient

**HTTP + REST (Request-Response):**
- Assumes both parties have reachable endpoints simultaneously.
- Agents in sandboxed environments typically cannot accept inbound connections.
- No support for long-running async tasks (polling is wasteful; webhooks require inbound ports).
- No standardized identity or authorization model.

**Model Context Protocol (MCP):**
- Designed for agent-to-tool communication, not agent-to-agent.
- Stateless coordination; every round-trip requires the central LLM orchestrator.
- No agent discovery, no cross-domain federation, no trust infrastructure.
- Security is an implementation detail left entirely to the developer.

**Google A2A Protocol v0.1:**
- Correctly identifies async task primitives but lacks cryptographic agent identity.
- Relies on OAuth 2.0, which breaks across organizational boundaries without pre-established trust.
- No capability negotiation handshake before task submission.
- No user confirmation as a first-class protocol primitive.

**WebSockets / gRPC:**
- Require persistent connections and reachable endpoints on both sides.
- Not suitable for sandbox-to-sandbox communication across firewalls.

### 1.3 The SMTP Analogy

AAMP draws its core architectural inspiration from SMTP (Simple Mail Transfer Protocol). SMTP solved the identical problem for human email communication in 1982: how do you exchange messages asynchronously between parties who may be:
- On different networks controlled by different organizations?
- Offline when a message is sent?
- Using incompatible internal systems?

SMTP's answer — store-and-forward relay servers, MX record-based discovery, envelope/body separation, and threading headers — remains the most successful federated communication architecture ever built.

AAMP applies the same principles to AI agent communication:

| SMTP Concept | AAMP Equivalent |
|---|---|
| Email address `user@domain` | Agent DID `did:web:domain/agents/id` |
| MX record discovery | DID Document `AAMPRelay` service endpoint |
| SMTP relay (MTA) | AAMP Relay Server |
| Message envelope | AAMP Envelope (signed, DID-bound) |
| `Message-ID` header | `messageId` (UUID v7) |
| `In-Reply-To / References` | `taskId / parentTaskId / rootTaskId` chain |
| MIME content types | AAMP `contentType` + typed payload |
| DKIM signature | Ed25519 envelope signature |
| TLS transport | HTTPS between relays |

---

## 2. Protocol Overview

### 2.1 Architecture

```
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│  ORGANIZATION A                  │      │  ORGANIZATION B                  │
│                                  │      │                                  │
│  ┌─────────────┐   NATS/SSE      │      │    NATS/SSE  ┌─────────────┐    │
│  │ Finance Bot │ ◄──────────► ┌──┴──────┴──┐ ◄──────── │ Research Bot│    │
│  │ (Sandbox)   │              │  Relay A   │ HTTPS POST │  (Sandbox)  │    │
│  └─────────────┘              │            │ /inbound   └─────────────┘    │
│                               │  (NATS     │            ┌──────────┐       │
│  ┌─────────────┐   NATS/SSE   │  JetStream)│            │  Relay B │       │
│  │ Analyst Bot │ ◄──────────► └──┬──────┬──┘            │          │       │
│  │ (Sandbox)   │              │  │      │                └──────────┘       │
│  └─────────────┘              │  │      │                                  │
└──────────────────────────────┘  │      └──────────────────────────────────┘
                                  │
                         Public Internet
```

**Key invariant:** Agents only make *outbound* connections to their relay. The relay is the only publicly-addressable component. This allows agents to operate behind firewalls and in sandboxes without any inbound port requirements.

### 2.2 Protocol Layers

```
┌───────────────────────────────────────────────────────────────┐
│  L9  Semantic / Intent Layer                                   │
│       Agent Card discovery, capability negotiation (PROBE),    │
│       UCAN-scoped authorization                               │
├───────────────────────────────────────────────────────────────┤
│  L8  AAMP Message Envelope Layer                               │
│       DID identity, task threading, routing mode,             │
│       Ed25519 signatures, TTL                                  │
├───────────────────────────────────────────────────────────────┤
│  L7  Transport / Bus Layer                                     │
│       NATS JetStream (intra-org), HTTPS (inter-org relay hop) │
├───────────────────────────────────────────────────────────────┤
│  L6  Serialization Layer                                       │
│       JSON (default), Protobuf (high-frequency), Avro (audit) │
├───────────────────────────────────────────────────────────────┤
│  L5  Identity / Auth Layer                                     │
│       did:key (ephemeral), did:web (persistent), UCAN tokens  │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Addressing

### 3.1 Agent Identifiers

Every AAMP agent MUST have a Decentralized Identifier (DID) as its canonical address. The DID spec is defined at https://www.w3.org/TR/did-1.1/.

**For ephemeral agents** (short-lived tasks, test agents):
```
did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```
Derived deterministically from the agent's Ed25519 public key. No network resolution required.

**For persistent organizational agents:**
```
did:web:company-a.com:agents:finance-bot-01
```
Resolves to: `https://company-a.com/agents/finance-bot-01/did.json`

### 3.2 DID Document Structure

Every agent's DID Document MUST contain:

```json
{
  "@context": ["https://www.w3.org/ns/did/v1"],
  "id": "did:web:company-a.com:agents:finance-bot-01",
  "verificationMethod": [{
    "id": "did:web:company-a.com:agents:finance-bot-01#key-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:company-a.com:agents:finance-bot-01",
    "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  }],
  "authentication": ["did:web:company-a.com:agents:finance-bot-01#key-1"],
  "service": [{
    "id": "did:web:company-a.com:agents:finance-bot-01#aamp-relay",
    "type": "AAMPRelay",
    "serviceEndpoint": "https://relay.company-a.com/inbound"
  }]
}
```

The `AAMPRelay` service endpoint is the "MX record" equivalent — it tells incoming relays where to POST messages for this agent.

### 3.3 NATS Subject Namespace

Within a relay, agents are addressed by NATS subjects:

```
aamp.<domain>.<agentId>.<channel>

Examples:
  aamp.acme.com.finance-bot-01.inbox    — agent's durable task inbox
  aamp.acme.com.finance-bot-01.status   — ephemeral status/heartbeat
  aamp.events                           — broadcast task lifecycle events
```

---

## 4. The AAMP Envelope

The Envelope is the atomic unit of AAMP communication. All fields except `payload` are part of the cryptographically signed surface.

### 4.1 Canonical Schema

```typescript
interface Envelope {
  // Identity
  messageId:     string;   // UUID v7 (time-ordered)
  senderDid:     string;   // sender's DID
  recipientDid:  string;   // recipient's DID

  // Task threading (SMTP References equivalent)
  taskId:        string;   // this task's unique ID
  parentTaskId?: string;   // parent task (if sub-task)
  rootTaskId?:   string;   // root originating task

  // Routing
  replyToMailbox?: string; // where to send the response
  ttlMs?:          number; // message time-to-live (0 = no expiry)
  routingMode:     RoutingMode;
  messageType:     MessageType;
  status:          TaskStatus;

  // Security
  ucanProof?:  string;     // base64url UCAN capability token
  signature?:  string;     // base64url Ed25519 signature

  // Content
  payload?:     unknown;
  contentType?: string;

  // Metadata
  metadata?:    Record<string, string>;
  createdAt:    number;    // Unix milliseconds
  aampVersion:  string;    // "0.1.0"
}
```

### 4.2 Signing

The signing surface is the deterministic JSON serialization of all fields except `signature`, with consistent key ordering:

```
fields = {messageId, senderDid, recipientDid, taskId, parentTaskId,
          rootTaskId, replyToMailbox, ttlMs, routingMode, messageType,
          status, ucanProof, createdAt, aampVersion}
signature = Ed25519.sign(UTF8(JSON.stringify(fields)), senderPrivateKey)
```

---

## 5. Routing Modes

AAMP defines five routing modes, drawn from IETF `draft-rosenberg-ai-protocols-00`:

| Mode | Description | Use Case |
|---|---|---|
| `BLIND_TRANSFER` | Agent A hands off completely; no longer involved | Delegation to specialist |
| `SUPERVISED_TRANSFER` | Agent A monitors until B confirms receipt | Normal task dispatch |
| `SIDEBAR` | Agent A spawns B for sub-task, stays primary | Parallel research |
| `CONFERENCE` | Multiple agents collaborate on the same task | Multi-agent consensus |
| `PASSTHROUGH` | Agent A proxies between user and Agent B | Transparent routing |

---

## 6. Message Types

| Type | Description |
|---|---|
| `TASK` | Submit a new task to an agent |
| `RESPONSE` | Return the result of a completed task |
| `STATUS` | Heartbeat or progress update (RUNNING, BLOCKED, etc.) |
| `PROBE` | Pre-task capability negotiation request |
| `PROBE_RESPONSE` | Response to a capability probe |
| `CONFIRM` | Human-in-the-loop confirmation (AWAITING_CONFIRMATION → RUNNING) |
| `CANCEL` | Cancel an in-flight task |

---

## 7. Agent Card

Every agent MUST publish an Agent Card — a JSON discovery document analogous to SMTP's MX record combined with an API specification.

```json
{
  "aampVersion": "0.1.0",
  "did": "did:web:company-b.com:agents:research-bot-01",
  "name": "Research Bot 01",
  "description": "Summarizes documents and performs web research",
  "endpoint": "https://relay.company-b.com",
  "mailboxSubject": "aamp.company-b.com.research-bot-01.inbox",
  "capabilities": [
    {
      "id": "summarize-pdf",
      "name": "Summarize PDF",
      "description": "Extracts key insights from a PDF at a given URL",
      "inputSchemaUrl": "https://company-b.com/schemas/summarize-pdf-input.json",
      "outputSchemaUrl": "https://company-b.com/schemas/summarize-pdf-output.json",
      "estimatedCost": { "unit": "tokens", "maxUnits": 4096 }
    }
  ],
  "supportedRoutingModes": ["BLIND_TRANSFER", "SUPERVISED_TRANSFER"],
  "authMethods": ["ucan", "did-key"],
  "publicKey": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "updatedAt": 1741737600000
}
```

---

## 8. Capability Negotiation (PROBE)

Before submitting a resource-intensive task, the sending agent SHOULD send a PROBE message to verify the receiving agent's availability and estimated cost.

```
Agent A                     Relay                      Agent B
   │                          │                           │
   │──── PROBE ──────────────►│─────── PROBE ────────────►│
   │       capabilityId       │                           │
   │       parameters         │                           │
   │                          │◄──── PROBE_RESPONSE ──────│
   │◄─── PROBE_RESPONSE ──────│       accepted: true      │
   │       accepted: true     │       costEstimate        │
   │       estimatedLatencyMs │       tokenExpiresInMs    │
   │                          │                           │
   │──── TASK ───────────────►│─────── TASK ─────────────►│
   │       (with UCAN proof)  │                           │
```

The `tokenExpiresInMs` field in `PROBE_RESPONSE` indicates how long Agent B will hold its processing slot open. Agent A MUST submit the TASK before this window expires.

---

## 9. Identity and Security

### 9.1 Why Not OAuth 2.0?

Standard bearer tokens (JWT/OAuth) fail in async distributed agent systems:
- Message brokers do not forward authorization context.
- Any relay in the pipeline can silently impersonate an agent (bearer token theft).
- Token replay attacks across task boundaries are trivial.
- Pre-established trust relationships are required between every pair of organizations.

### 9.2 UCAN-Inspired Capability Tokens

AAMP uses capability tokens inspired by UCAN (User-Controlled Authorization Networks). Each token:

```json
{
  "v":   "0.1.0",
  "iss": "did:web:company-a.com:agents:finance-bot-01",
  "aud": "did:web:company-b.com:agents:research-bot-01",
  "cap": [
    {
      "resource": "aamp:agent:did:web:company-b.com:agents:research-bot-01",
      "ability":  "aamp/summarize-pdf"
    }
  ],
  "exp": 1741738200,
  "nbf": 1741737900,
  "nnc": "abc123xyz",
  "sig": "<Ed25519 signature>"
}
```

**Key properties:**
- **Audience binding**: Token is only valid for the specific recipient DID.
- **Scope restriction**: Token grants only the specific `ability` on the specific `resource`.
- **Time-bounded**: `exp` and `nbf` prevent stale token replay.
- **Nonce**: `nnc` prevents replay of the exact token across task boundaries.
- **Delegation chain**: `prf` field enables provable delegation (Agent A → Agent B → Agent C) without granting more than A had.

### 9.3 Delegation (Attenuation)

When Agent A delegates to Agent B and Agent B needs to further delegate to Agent C:

```
Token 1: A grants B → summarize-pdf (max 4096 tokens)
Token 2: B grants C → summarize-pdf (max 2048 tokens, prf=[Token1.id])
```

Agent C receives Token 2. Verifying Agent C proves:
1. C was explicitly granted the capability by B.
2. B's grant is a subset of A's grant (attenuation).
3. The chain is cryptographically verifiable end-to-end.

---

## 10. Federation Protocol

### 10.1 Cross-Domain Message Flow

```
[Sandbox A]              [Internet]              [Sandbox B]
Finance Agent            Relay A        Relay B   Research Agent
    │                      │              │            │
    │── outbound NATS ────►│              │◄── outbound NATS ──│
    │                      │              │            │
    │ send(to=ResearchBot) │              │            │
    │─────────────────────►│              │            │
    │                      │ 1. Resolve DID of ResearchBot
    │                      │    → finds Relay B serviceEndpoint
    │                      │──── HTTPS POST /inbound ─►│
    │                      │    (signed envelope)       │
    │                      │                            │ deliver to NATS
    │                      │                            │─────────────────►│
    │                      │                            │
    │                      │            [Research Bot processes task]
    │                      │                            │
    │                      │◄─── HTTPS POST /inbound ───│
    │                      │    (signed response)        │
    │◄────────────────────│              │            │
    │ receive result        │              │            │
```

### 10.2 Relay-to-Relay Authentication

Inter-relay HTTP calls are authenticated via the message envelope's Ed25519 signature:

1. Relay B receives a POST to `/inbound`.
2. Relay B extracts `senderDid` from the envelope.
3. Relay B resolves `senderDid` → fetches sender's DID Document.
4. Relay B verifies the `signature` field against the sender's public key.
5. If valid, Relay B queues the message for the recipient agent.
6. If invalid, Relay B returns HTTP 401.

This is equivalent to DKIM (DomainKeys Identified Mail) but using self-sovereign DID keys instead of DNS-managed keys.

### 10.3 Store-and-Forward Semantics

NATS JetStream provides SMTP-style store-and-forward for agents:

- Messages are persisted in a durable stream even if the recipient agent is offline.
- When the agent reconnects (outbound NATS connection), it receives queued messages.
- Delivery is retried up to N times (configurable) before routing to a dead-letter queue.
- Message TTL (`ttlMs`) is enforced by the stream's `max_age` setting.

---

## 11. Interaction Types

AAMP supports all four interaction modalities:

| Type | Description | Example |
|---|---|---|
| Transactional-Sync | Single request, wait for response | `agent.send(...)` with `await` |
| Transactional-Async | Fire and forget; collect result later | Submit task, poll `/status` |
| Conversational-Sync | Multi-turn dialogue, inline | Clarification loop during task |
| Conversational-Async | Multi-turn dialogue, deferred | Agent pauses for human confirmation |

The `AWAITING_CONFIRMATION` task status and `CONFIRM` message type implement human-in-the-loop flows as a first-class protocol primitive.

---

## 12. HTTP API Reference

### Relay Endpoints

#### `POST /mailbox/{agentId}/send`
Deposit a message into an agent's mailbox.

**Request body:** AAMP Envelope (JSON)

**Response:**
```json
{ "messageId": "...", "taskId": "...", "status": "queued" }
```

**Status codes:**
- `202 Accepted` — Message queued for delivery
- `400 Bad Request` — Malformed envelope
- `401 Unauthorized` — Invalid signature
- `410 Gone` — TTL expired before delivery
- `404 Not Found` — Unknown recipient agent

---

#### `GET /mailbox/notifications`
Server-Sent Events stream of incoming messages.

**Query params:** `agentId` (required)

**Response:** `Content-Type: text/event-stream`

```
event: connected
data: {}

event: message
data: {"messageId":"...","senderDid":"...","payload":{...}}

: heartbeat
```

---

#### `PATCH /status`
Update task status (heartbeat).

**Request body:**
```json
{
  "agentId": "finance-bot-01",
  "taskId":  "task-uuid",
  "status":  "RUNNING",
  "message": "Processing page 12/50"
}
```

---

#### `POST /inbound`
Inter-relay federation endpoint — receives messages from other relays.

**Request body:** AAMP Envelope (JSON)

**Required headers:**
- `X-AAMP-Version: 0.1.0`
- `X-AAMP-Sender: <senderDid>`

---

#### `GET /agents/{agentId}/did.json`
Serve the agent's DID Document (enables `did:web` resolution).

---

## 13. SDK Interface

```typescript
// TypeScript
const agent = new AampAgent({ did, privateKey, relayUrl });
await agent.connect();

// Send
const result = await agent.send({
  to:           "did:web:company-b.com/agents/research-bot",
  capability:   "summarize-pdf",
  payload:      { url: "...", format: "bullet-points" },
  routingMode:  RoutingMode.SUPERVISED_TRANSFER,
  ttlMs:        300_000,
});

// Receive
agent.on("task", async (envelope, respond) => {
  const result = await processTask(envelope);
  await respond({ success: true, output: result });
});
```

```python
# Python
agent = AampAgent(did=did, keypair=keypair, relay_url="http://relay-b:8080")
await agent.connect()

@agent.task_handler("summarize-pdf")
async def handle(envelope, respond):
    result = await summarize(envelope.payload["input"]["url"])
    await respond(success=True, output=result)

await agent.listen()
```

---

## 14. Security Considerations

### 14.1 Prompt Injection Attribution

Because every envelope carries a cryptographically verifiable `senderDid`, receivers can detect prompt injection attacks: if an incoming message's `senderDid` does not match the claimed identity in the payload, the signature will fail to verify.

### 14.2 Capability Scope Violations

Relays SHOULD verify that the `ucanProof` in an envelope grants the sender authority to invoke the specified `capability`. This is the authorization gate equivalent to email's SPF/DMARC.

### 14.3 Replay Attacks

The nonce (`nnc`) in capability tokens prevents token replay. Relays SHOULD maintain a short-lived nonce cache (TTL matching the token's `exp`) to reject duplicate tokens.

### 14.4 DID Key Rotation

`did:key` DIDs are immutable (derived from the key). If a key is compromised:
- Ephemeral agents: Generate a new `did:key` — no migration needed.
- Persistent agents: Update the DID Document at the `did:web` URL with a new verification method.

### 14.5 Transport Security

Inter-relay HTTP communication MUST use HTTPS in production. The relay Dockerfile and compose configuration use plain HTTP only for local development.

---

## 15. Comparison with Existing Protocols

| Feature | AAMP | MCP | Google A2A v0.1 | Raw HTTP |
|---|---|---|---|---|
| Agent-to-agent | ✓ | ✗ (tool-only) | ✓ | ✓ |
| Async long-running tasks | ✓ | ✗ | ✓ | ✗ |
| No inbound ports needed | ✓ | ✓ | ✗ | ✗ |
| Cross-company federation | ✓ | ✗ | ✗ | Manual |
| Cryptographic agent identity | ✓ (DID) | ✗ | ✗ (OAuth) | ✗ |
| Scoped capability tokens | ✓ (UCAN) | ✗ | ✗ (OAuth) | ✗ |
| Pre-task negotiation (PROBE) | ✓ | ✗ | ✗ | ✗ |
| Store-and-forward (offline) | ✓ | ✗ | Partial | ✗ |
| Human-in-the-loop primitives | ✓ | ✗ | Partial | ✗ |
| Task delegation chains | ✓ | ✗ | ✗ | ✗ |
| Transport agnostic | ✓ | Partial | ✗ | ✗ |
| Open standard | ✓ | ✓ | ✓ | N/A |

---

## 16. Roadmap

### v0.1.0 (Current — Month 1)
- Core Envelope spec and Protobuf schema
- NATS JetStream relay server
- did:key and did:web identity
- Ed25519 envelope signing
- UCAN-inspired capability tokens (simplified)
- TypeScript SDK + Python SDK
- Two-relay cross-company demo

### v0.2.0 (Month 2)
- Full UCAN v1.0 compliance
- did:key revocation registry
- Relay clustering (NATS cluster / Raft)
- TLS for inter-relay communication
- Prometheus metrics + OpenTelemetry traces
- Capability registry (public index of Agent Cards)

### v0.3.0 (Month 3)
- gRPC transport option (alongside NATS/HTTP)
- Multimodal payloads (audio, image, binary artifacts)
- Agent version negotiation
- RFC submission to IETF AI Agents working group
- npm + PyPI SDK releases (`aamp-sdk`)

---

## 17. References

- [W3C Decentralized Identifiers (DIDs) v1.1](https://www.w3.org/TR/did-1.1/)
- [IETF draft-rosenberg-ai-protocols-00](https://datatracker.ietf.org/doc/html/draft-rosenberg-ai-protocols-00)
- [Google A2A Protocol Specification](https://google.github.io/A2A/specification/)
- [UCAN Specification](https://ucan.xyz/)
- [NATS JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [Anthropic Model Context Protocol](https://modelcontextprotocol.io/)
- [arXiv: ACP — Agent Communication Protocol (Feb 2026)](https://arxiv.org/abs/2602.15055)
- [Ed25519 by @noble/ed25519](https://github.com/paulmillr/noble-ed25519)

---

*This RFC is open for community feedback. Submit issues and proposals at https://github.com/aamp-protocol/aamp.*
