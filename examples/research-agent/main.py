"""
Research Agent — Company B

This agent runs in Company B's sandbox and demonstrates receiving AAMP tasks
from an agent at Company A via cross-relay federation.

Flow:
  1. Connect to Company B's relay (relay-b at localhost:8081) via NATS.
  2. Register with the relay (publishes an Agent Card + DID Document).
  3. Listen for incoming tasks on its NATS mailbox subject.
  4. Handle 'summarize-pdf' tasks (simulated with a mock summary).
  5. Send the signed response back through the relay to the Finance Agent.

Run:
  # 1. Start the stack
  docker-compose -f docker/docker-compose.yml up -d

  # 2. Install Python dependencies
  pip install -r examples/research-agent/requirements.txt

  # 3. Start this agent
  python examples/research-agent/main.py

  # 4. In another terminal, run the Finance Agent
  cd examples/finance-agent && pnpm start
"""

import asyncio
import json
import os
import time
from typing import Any

from aamp_sdk import AampAgent, TaskStatus, RoutingMode
from aamp_sdk.identity import KeyPair, create_did_web, create_did_web_document
from aamp_sdk.types import Envelope, ProbeResponse, CostEstimate, MessageType, AAMP_VERSION


RELAY_B_URL  = os.getenv("RELAY_B_URL", "http://localhost:8081")
NATS_URL     = os.getenv("NATS_URL", "nats://localhost:4222")
DOMAIN       = os.getenv("RELAY_DOMAIN", "company-b.local")
AGENT_ID     = os.getenv("AGENT_ID", "research-bot-01")


async def main():
    # ── Step 1: Generate or restore identity ──────────────────────
    keypair  = KeyPair.generate()
    did      = create_did_web(DOMAIN, f"agents/{AGENT_ID}")

    print(f"[research-agent] Identity: {did}")
    print(f"[research-agent] Relay: {RELAY_B_URL}")
    print(f"[research-agent] NATS: {NATS_URL}")

    # ── Step 2: Initialize agent ───────────────────────────────────
    agent = AampAgent(
        did=did,
        keypair=keypair,
        relay_url=RELAY_B_URL,
        nats_url=NATS_URL,
        name="Research Bot 01",
        domain=DOMAIN,
        agent_id=AGENT_ID,
        capabilities=[
            {
                "id":          "summarize-pdf",
                "name":        "Summarize PDF",
                "description": "Extracts key insights from a PDF document",
                "estimatedCost": {"unit": "tokens", "maxUnits": 4096},
            },
            {
                "id":          "web-search",
                "name":        "Web Search",
                "description": "Searches the web and returns structured results",
                "estimatedCost": {"unit": "tokens", "maxUnits": 2048},
            },
        ],
    )

    await agent.connect()

    # ── Step 3: Register PROBE handler ────────────────────────────
    # The probe handler responds to capability negotiation requests BEFORE
    # the actual task is submitted. Agent A can use this to check cost/latency.
    @agent.on("probe")
    async def handle_probe(envelope: Envelope, respond) -> None:
        probe_payload = envelope.payload or {}
        capability_id = probe_payload.get("capabilityId", "")

        supported = ["summarize-pdf", "web-search"]

        if capability_id in supported:
            response = ProbeResponse(
                accepted=True,
                costEstimate=CostEstimate(unit="tokens", maxUnits=4096),
                estimatedLatencyMs=3000,
                tokenExpiresInMs=30_000,
            )
            print(f"[research-agent] Probe accepted for: {capability_id}")
        else:
            response = ProbeResponse(
                accepted=False,
                rejectionReason=f"Unsupported capability: {capability_id}. Supported: {supported}",
            )
            print(f"[research-agent] Probe rejected for: {capability_id}")

        await respond(success=True, output=response.model_dump())

    # ── Step 4: Register task handler for summarize-pdf ───────────
    @agent.task_handler("summarize-pdf")
    async def handle_summarize(envelope: Envelope, respond) -> None:
        task_payload = envelope.payload or {}
        pdf_input    = task_payload.get("input", {})
        pdf_url      = pdf_input.get("url", "unknown")
        focus_areas  = pdf_input.get("focus", [])

        print(f"\n[research-agent] Received summarize-pdf task")
        print(f"[research-agent] PDF URL: {pdf_url}")
        print(f"[research-agent] Focus: {focus_areas}")
        print(f"[research-agent] Task ID: {envelope.taskId}")
        print(f"[research-agent] Sender: {envelope.senderDid}")

        # Send a heartbeat to show we're working
        await agent.update_status(envelope.taskId, TaskStatus.RUNNING, "Fetching and analyzing PDF...")
        await asyncio.sleep(1)  # Simulate processing time

        # Simulate PDF analysis
        summary = await simulate_pdf_summary(pdf_url, focus_areas)

        print(f"[research-agent] Summary generated, sending response...")

        await respond(
            success=True,
            output={
                "url":        pdf_url,
                "summary":    summary["summary"],
                "keyPoints":  summary["key_points"],
                "wordCount":  summary["word_count"],
                "processedAt": int(time.time() * 1000),
                "agentId":    AGENT_ID,
                "agentDid":   did,
            },
        )

        print(f"[research-agent] Response sent for task {envelope.taskId}")

    # ── Step 5: Register web-search handler ───────────────────────
    @agent.task_handler("web-search")
    async def handle_web_search(envelope: Envelope, respond) -> None:
        task_payload = envelope.payload or {}
        search_input = task_payload.get("input", {})
        query        = search_input.get("query", "")

        print(f"[research-agent] Web search: '{query}'")
        await asyncio.sleep(0.5)

        await respond(
            success=True,
            output={
                "query":   query,
                "results": [
                    {"title": f"Result 1 for '{query}'", "url": "https://example.com/1", "snippet": "..."},
                    {"title": f"Result 2 for '{query}'", "url": "https://example.com/2", "snippet": "..."},
                ],
                "agentId": AGENT_ID,
            },
        )

    # ── Step 6: Listen ─────────────────────────────────────────────
    print(f"\n[research-agent] Ready. Listening for tasks on:")
    print(f"  NATS subject: aamp.{DOMAIN}.{AGENT_ID}.inbox")
    print(f"  SSE endpoint: {RELAY_B_URL}/mailbox/notifications?agentId={AGENT_ID}")
    print("\nPress Ctrl+C to stop.\n")

    await agent.listen()


async def simulate_pdf_summary(url: str, focus: list[str]) -> dict[str, Any]:
    """Simulated PDF analysis — replace with real LLM/OCR logic."""
    await asyncio.sleep(2)  # Simulate LLM processing time

    return {
        "summary": (
            f"Q4 2025 Financial Report Summary\n\n"
            f"The quarterly report from {url.split('/')[-1]} reveals strong performance "
            f"across key financial metrics. Revenue grew 18% YoY driven by product expansion. "
            f"Operating margins improved by 3.2pp. Management provided optimistic FY2026 guidance."
        ),
        "key_points": [
            "Revenue: $2.4B (+18% YoY)",
            "Operating margin: 24.1% (+3.2pp)",
            "Net income: $412M (+22% YoY)",
            "FY2026 guidance: Revenue $10.2–10.5B",
            "New product line launch scheduled Q2 2026",
        ] if "revenue" in focus else [
            "Document processed successfully",
            "See full report for details",
        ],
        "word_count": 12_450,
    }


if __name__ == "__main__":
    asyncio.run(main())
