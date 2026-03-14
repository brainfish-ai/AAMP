"""
AampAgent — Python SDK main class.

Usage:
    import asyncio
    from aamp_sdk import AampAgent
    from aamp_sdk.identity import KeyPair, create_did_key

    async def main():
        keypair = KeyPair.generate()
        did     = create_did_key(keypair)

        agent = AampAgent(
            did=did,
            keypair=keypair,
            relay_url="http://localhost:8080",
            name="research-agent",
            domain="company-b.com",
            agent_id="research-bot-01",
        )

        await agent.connect()

        @agent.task_handler("summarize-pdf")
        async def handle_summarize(envelope, respond):
            payload = envelope.payload
            result  = {"summary": f"Summary of {payload['input']['url']}"}
            await respond(success=True, output=result)

        await agent.listen()

    asyncio.run(main())
"""

from __future__ import annotations
import asyncio
import json
import time
from typing import Any, Callable, Coroutine, Optional
import uuid

import aiohttp
import nats
from nats.aio.client import Client as NatsClient

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
from .identity import KeyPair, create_did_key, issue_capability_token, sign_envelope

TaskHandlerFn = Callable[[Envelope, Callable], Coroutine[Any, Any, None]]


class AampAgent:
    def __init__(
        self,
        did: str,
        keypair: KeyPair,
        relay_url: str,
        name: Optional[str] = None,
        nats_url: Optional[str] = None,
        nats_creds: Optional[str] = None,
        nats_creds_file: Optional[str] = None,
        domain: str = "localhost",
        agent_id: Optional[str] = None,
        capabilities: Optional[list] = None,
    ):
        self.did         = did
        self.keypair     = keypair
        self.relay_url   = relay_url.rstrip("/")
        self.name        = name or self._extract_agent_id(did)
        self.nats_url    = nats_url
        self.nats_creds  = nats_creds
        self.nats_creds_file = nats_creds_file
        self.domain      = domain
        self.agent_id    = agent_id or self._extract_agent_id(did)
        self.capabilities = capabilities or []

        self._nc: Optional[NatsClient] = None
        self._handlers: dict[str, list[TaskHandlerFn]] = {}
        self._pending: dict[str, asyncio.Future] = {}
        self._running = False

    # ─────────────────────────────────────────────────────────────
    #  Lifecycle
    # ─────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        await self._register_with_relay()

        if self.nats_url:
            # Transform WebSocket URLs to TLS for the nats-py TCP client
            server = self.nats_url
            if server.startswith("wss://"):
                server = "tls://" + server[6:]
            elif server.startswith("ws://"):
                server = "nats://" + server[5:]

            connect_opts: dict = {"servers": server}
            creds_file = self.nats_creds_file
            if creds_file:
                connect_opts["user_credentials"] = creds_file
            elif self.nats_creds:
                import tempfile, os as _os
                tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".creds", delete=False)
                tmp.write(self.nats_creds)
                tmp.close()
                connect_opts["user_credentials"] = tmp.name
            self._nc = await nats.connect(**connect_opts)
            subject  = f"aamp.{self.domain}.{self.agent_id}.inbox"
            await self._nc.subscribe(subject, cb=self._nats_message_handler)
            print(f"[aamp-agent] {self.did} connected via NATS ({subject})")
        else:
            print(f"[aamp-agent] {self.did} connected via HTTP SSE")

        self._running = True

    async def disconnect(self) -> None:
        self._running = False
        if self._nc:
            await self._nc.drain()

    async def listen(self) -> None:
        """Block and listen for incoming tasks. Use with asyncio.run()."""
        if self.nats_url:
            # NATS subscription is push-based; just keep the loop alive
            while self._running:
                await asyncio.sleep(1)
        else:
            # SSE polling loop
            await self._sse_listen_loop()

    # ─────────────────────────────────────────────────────────────
    #  Sending
    # ─────────────────────────────────────────────────────────────

    async def send(
        self,
        to: str,
        capability: str,
        payload: Any,
        routing_mode: RoutingMode = RoutingMode.SUPERVISED_TRANSFER,
        ttl_ms: int = 300_000,
        timeout_ms: int = 60_000,
    ) -> TaskResult:
        task_id    = str(uuid.uuid4())
        message_id = str(uuid.uuid4())

        token = issue_capability_token(
            issuer_did=self.did,
            audience_did=to,
            capabilities=[{"resource": f"aamp:agent:{to}", "ability": f"aamp/{capability}"}],
            keypair=self.keypair,
            expires_in_secs=ttl_ms // 1000,
        )

        task_payload = TaskPayload(capabilityId=capability, input=payload)

        envelope = Envelope(
            messageId=message_id,
            senderDid=self.did,
            recipientDid=to,
            taskId=task_id,
            replyToMailbox=f"aamp.{self.domain}.{self.agent_id}.inbox",
            ttlMs=ttl_ms,
            routingMode=routing_mode,
            messageType=MessageType.TASK,
            status=TaskStatus.SUBMITTED,
            ucanProof=json.dumps(token),
            payload=task_payload.model_dump(),
            contentType="application/json",
            createdAt=int(time.time() * 1000),
            aampVersion=AAMP_VERSION,
        )

        envelope = sign_envelope(envelope, self.keypair)

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.relay_url}/mailbox/{self.agent_id}/send",
                json=envelope.model_dump(),
                headers={"Content-Type": "application/json"},
            ) as resp:
                if resp.status not in (200, 201, 202):
                    text = await resp.text()
                    raise RuntimeError(f"Relay rejected message: {text}")

        # Wait for response
        future: asyncio.Future[TaskResult] = asyncio.get_event_loop().create_future()
        self._pending[task_id] = future

        try:
            return await asyncio.wait_for(future, timeout=timeout_ms / 1000)
        except asyncio.TimeoutError:
            self._pending.pop(task_id, None)
            raise TimeoutError(f"Task {task_id} timed out after {timeout_ms}ms")

    async def update_status(self, task_id: str, status: TaskStatus, message: Optional[str] = None) -> None:
        async with aiohttp.ClientSession() as session:
            await session.patch(
                f"{self.relay_url}/status",
                json={"agentId": self.agent_id, "taskId": task_id, "status": status.value, "message": message},
                headers={"Content-Type": "application/json"},
            )

    # ─────────────────────────────────────────────────────────────
    #  Handler registration
    # ─────────────────────────────────────────────────────────────

    def task_handler(self, capability_id: str):
        """Decorator to register a handler for a specific capability."""
        def decorator(fn: TaskHandlerFn):
            if capability_id not in self._handlers:
                self._handlers[capability_id] = []
            self._handlers[capability_id].append(fn)
            return fn
        return decorator

    def on(self, event: str, fn: Optional[TaskHandlerFn] = None):
        """Register a handler. Can be used as decorator `@agent.on("event")` or direct call."""
        def decorator(f: TaskHandlerFn) -> TaskHandlerFn:
            if event not in self._handlers:
                self._handlers[event] = []
            self._handlers[event].append(f)
            return f
        if fn is not None:
            return decorator(fn)
        return decorator

    # ─────────────────────────────────────────────────────────────
    #  Internal: message handling
    # ─────────────────────────────────────────────────────────────

    async def _handle_envelope(self, envelope: Envelope) -> None:
        # Resolve pending send() futures
        pending = self._pending.pop(envelope.taskId, None)
        if pending and not pending.done():
            if envelope.messageType in (MessageType.RESPONSE,) or envelope.status == TaskStatus.COMPLETED:
                pending.set_result(envelope.payload)
                return
            if envelope.status == TaskStatus.FAILED:
                result = envelope.payload or {}
                pending.set_exception(RuntimeError(result.get("errorMessage", "Task failed")))
                return

        # Dispatch to event handlers based on message type
        async def respond(success: bool = True, output: Any = None, error_code: str = "", error_message: str = "") -> None:
            await self._send_response(envelope, success=success, output=output, error_code=error_code, error_message=error_message)

        if envelope.messageType == MessageType.PROBE:
            handlers = self._handlers.get("probe", [])
            if not handlers:
                await respond(success=False, error_code="NOT_SUPPORTED", error_message="Probe not supported")
                return
            for handler in handlers:
                try:
                    await handler(envelope, respond)
                except Exception as e:
                    await respond(success=False, error_code="HANDLER_ERROR", error_message=str(e))

        elif envelope.messageType == MessageType.TASK:
            task_payload = envelope.payload or {}
            capability_id = task_payload.get("capabilityId", "*")
            handlers = self._handlers.get(capability_id, []) + self._handlers.get("*", [])

            if not handlers:
                await respond(success=False, error_code="NOT_IMPLEMENTED", error_message=f"No handler for {capability_id}")
                return

            for handler in handlers:
                try:
                    await handler(envelope, respond)
                except Exception as e:
                    await respond(success=False, error_code="HANDLER_ERROR", error_message=str(e))

    async def _send_response(
        self,
        original: Envelope,
        success: bool,
        output: Any = None,
        error_code: str = "",
        error_message: str = "",
    ) -> None:
        result = TaskResult(success=success, output=output, errorCode=error_code or None, errorMessage=error_message or None)

        # Use PROBE_RESPONSE type for probe replies so the relay routes it correctly
        is_probe_reply = original.messageType == MessageType.PROBE
        msg_type = MessageType.PROBE_RESPONSE if is_probe_reply else MessageType.RESPONSE

        envelope = Envelope(
            messageId=str(uuid.uuid4()),
            senderDid=self.did,
            recipientDid=original.senderDid,
            taskId=original.taskId,
            rootTaskId=original.rootTaskId or original.taskId,
            # Echo back the original replyToMailbox so the relay routes via NATS directly
            replyToMailbox=original.replyToMailbox,
            routingMode=RoutingMode.SUPERVISED_TRANSFER,
            messageType=msg_type,
            status=TaskStatus.COMPLETED if success else TaskStatus.FAILED,
            payload=result.model_dump(),
            contentType="application/json",
            createdAt=int(time.time() * 1000),
            aampVersion=AAMP_VERSION,
        )
        envelope = sign_envelope(envelope, self.keypair)

        async with aiohttp.ClientSession() as session:
            await session.post(
                f"{self.relay_url}/mailbox/{self.agent_id}/send",
                json=envelope.model_dump(),
                headers={"Content-Type": "application/json"},
            )

    async def _nats_message_handler(self, msg) -> None:
        try:
            data     = json.loads(msg.data.decode())
            envelope = Envelope(**data)
            await self._handle_envelope(envelope)
        except Exception as e:
            print(f"[aamp-agent] Error handling NATS message: {e}")

    async def _sse_listen_loop(self) -> None:
        url = f"{self.relay_url}/mailbox/notifications?agentId={self.agent_id}"
        while self._running:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers={"Accept": "text/event-stream"}) as resp:
                        buffer = ""
                        async for chunk in resp.content.iter_any():
                            buffer += chunk.decode()
                            while "\n\n" in buffer:
                                event, buffer = buffer.split("\n\n", 1)
                                for line in event.split("\n"):
                                    if line.startswith("data: "):
                                        try:
                                            data     = json.loads(line[6:])
                                            envelope = Envelope(**data)
                                            await self._handle_envelope(envelope)
                                        except Exception:
                                            pass
            except Exception as e:
                if self._running:
                    print(f"[aamp-agent] SSE error, reconnecting in 3s: {e}")
                    await asyncio.sleep(3)

    async def _register_with_relay(self) -> None:
        card = AgentCard(
            did=self.did,
            name=self.name,
            endpoint=self.relay_url,
            mailboxSubject=f"aamp.{self.domain}.{self.agent_id}.inbox",
            capabilities=self.capabilities,
            publicKey=self.keypair.public_key_multibase,
            updatedAt=int(time.time() * 1000),
        )
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.relay_url}/agents/register",
                json={"agentId": self.agent_id, "card": card.model_dump(), "publicKey": card.publicKey},
                headers={"Content-Type": "application/json"},
            ) as resp:
                if resp.status not in (200, 201):
                    text = await resp.text()
                    raise RuntimeError(f"Failed to register with relay: {text}")

        print(f"[aamp-agent] Registered {self.agent_id} with relay at {self.relay_url}")

    def _extract_agent_id(self, did: str) -> str:
        if did.startswith("did:web:"):
            return did.split(":")[-1]
        if did.startswith("did:key:"):
            return did[len("did:key:"):len("did:key:") + 12]
        return did.replace(":", "-").lower()
