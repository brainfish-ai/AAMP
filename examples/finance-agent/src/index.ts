/**
 * Finance Agent — Company A
 *
 * This agent runs in Company A's sandbox and demonstrates the full AAMP
 * cross-company communication flow:
 *
 *   1. Connect to Company A's relay (relay-a at localhost:8080).
 *   2. Probe Research Agent at Company B to check if it can summarize a PDF.
 *   3. If accepted, send the task with a scoped UCAN capability token.
 *   4. Relay A resolves Research Agent's DID → finds Relay B's endpoint.
 *   5. Relay A POSTs the signed envelope to Relay B via HTTP /inbound.
 *   6. Relay B queues the message for Research Agent.
 *   7. Research Agent processes it and POSTs the response back via Relay B → Relay A.
 *   8. Finance Agent receives the result via NATS subscription.
 *
 * Run:
 *   # 1. Start the stack
 *   docker-compose -f docker/docker-compose.yml up -d
 *
 *   # 2. Start the research agent (Python, Company B)
 *   cd examples/research-agent && python main.py
 *
 *   # 3. Run this agent
 *   cd examples/finance-agent && pnpm start
 */

import { readFileSync } from "fs";
import {
  AampAgent,
  generateKeyPair,
  createDidKey,
  DIDResolver,
  createDidWebDocument,
  RoutingMode,
  TaskStatus,
} from "@aamp/sdk";

const RELAY_A_URL         = process.env.RELAY_A_URL         ?? "http://localhost:8080";
const RELAY_B_URL         = process.env.RELAY_B_URL         ?? "http://localhost:8081";
const RELAY_C_URL         = process.env.RELAY_C_URL         ?? "http://localhost:8087";
const NATS_URL            = process.env.NATS_URL            ?? "nats://localhost:4222";
const RESEARCH_AGENT_ID   = process.env.RESEARCH_AGENT_ID   ?? "research-bot-01";

const NATS_CREDS = (() => {
  const file = process.env.NATS_CREDS_FILE;
  if (file) {
    try { return readFileSync(file, "utf8"); } catch { /* fall through */ }
  }
  return process.env.NATS_CREDS ?? "";
})();
const COMPLIANCE_AGENT_ID = process.env.COMPLIANCE_AGENT_ID ?? "compliance-bot-01";

async function main() {
  // ── Step 1: Generate identity ────────────────────────────────
  const keypair   = await generateKeyPair();
  const did       = createDidKey(keypair.publicKey);
  console.log(`[finance-agent] Identity: ${did}`);

  // ── Step 2: Initialize agent and connect to Relay A ──────────
  const agent = new AampAgent({
    did,
    privateKey:   keypair.privateKey,
    relayUrl:     RELAY_A_URL,
    natsUrl:      NATS_URL,
    natsCreds:    NATS_CREDS || undefined,
    name:         "Finance Bot 01",
    domain:       "company-a.local",
    agentId:      "finance-bot-01",
    capabilities: [],
  });

  await agent.connect();

  // ── Step 3: Pre-register remote DID Documents with Relay A ─────────────
  // In production this is resolved automatically via did:web DNS lookup.
  // For local dev we POST the DID Document to Relay A's /resolver/register
  // endpoint since company-b.local has no real DNS.
  const researchAgentDid = `did:web:company-b.local:agents:${RESEARCH_AGENT_ID}`;
  const mockResearchDIDDoc = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: researchAgentDid,
    verificationMethod: [],
    authentication:  [],
    assertionMethod: [],
    service: [{
      id:              `${researchAgentDid}#aamp-relay`,
      type:            "AAMPRelay",
      serviceEndpoint: `${RELAY_B_URL}/inbound`,
    }],
  };

  // Register the remote DID Document with Relay A so it knows where to forward
  await fetch(`${RELAY_A_URL}/resolver/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ did: researchAgentDid, document: mockResearchDIDDoc }),
  });

  console.log(`[finance-agent] Research Agent DID: ${researchAgentDid}`);
  console.log(`[finance-agent] Research Agent Relay: ${RELAY_B_URL}/inbound`);

  // Pre-register Compliance Agent (Company C — Vercel Sandbox, Relay C)
  const complianceAgentDid = `did:web:company-c.sandbox:agents:${COMPLIANCE_AGENT_ID}`;
  const mockComplianceDIDDoc = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: complianceAgentDid,
    verificationMethod: [],
    authentication:  [],
    assertionMethod: [],
    service: [{
      id:              `${complianceAgentDid}#aamp-relay`,
      type:            "AAMPRelay",
      serviceEndpoint: `${RELAY_C_URL}/inbound`,
    }],
  };
  await fetch(`${RELAY_A_URL}/resolver/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ did: complianceAgentDid, document: mockComplianceDIDDoc }),
  });
  console.log(`[finance-agent] Compliance Agent DID: ${complianceAgentDid}`);
  console.log(`[finance-agent] Compliance Agent Relay: ${RELAY_C_URL}/inbound (Vercel Sandbox)`);

  // ── Step 4: Probe Research Agent before committing ────────────
  console.log("\n[finance-agent] Probing Research Agent capability...");
  try {
    const probe = await agent.probe({
      to:           researchAgentDid,
      capabilityId: "summarize-pdf",
      parameters:   { maxPages: "50", format: "bullet-points" },
      timeoutMs:    8_000,
    });

    if (!probe.accepted) {
      console.log(`[finance-agent] Probe rejected: ${probe.rejectionReason}`);
      await agent.disconnect();
      return;
    }

    console.log(`[finance-agent] Probe accepted!`);
    if (probe.costEstimate) {
      console.log(`[finance-agent] Estimated cost: ${probe.costEstimate.maxUnits} ${probe.costEstimate.unit}`);
    }
    if (probe.estimatedLatencyMs) {
      console.log(`[finance-agent] Estimated latency: ${probe.estimatedLatencyMs}ms`);
    }
  } catch {
    // If research agent doesn't support PROBE, skip and send directly
    console.log("[finance-agent] Probe timed out — sending task directly");
  }

  // ── Step 5: Send the actual task ─────────────────────────────
  console.log("\n[finance-agent] Sending summarize-pdf task to Research Agent...");

  const taskPayload = {
    url:     "https://example.com/quarterly-report-q4-2025.pdf",
    format:  "bullet-points",
    maxPages: 50,
    focus:   ["revenue", "expenses", "guidance"],
  };

  await agent.updateStatus("init", TaskStatus.RUNNING, "Finance agent dispatching research task");

  try {
    const result = await agent.send({
      to:           researchAgentDid,
      capability:   "summarize-pdf",
      payload:      taskPayload,
      routingMode:  RoutingMode.SUPERVISED_TRANSFER,
      ttlMs:        120_000,  // 2 minute TTL
      timeoutMs:    90_000,   // wait up to 90 seconds for response
    });

    console.log("\n[finance-agent] ✓ Research task completed successfully!");
    console.log("[finance-agent] Summary received:");
    console.log(JSON.stringify(result, null, 2));

    // ── Step 6: Compliance check via Relay C (Vercel Sandbox) ────────────
    console.log("\n[finance-agent] Probing Compliance Agent (Vercel Sandbox, Relay C)...");
    const summary = (result as Record<string, unknown>)?.output as Record<string, unknown> | undefined;

    try {
      const complianceProbe = await agent.probe({
        to:           complianceAgentDid,
        capabilityId: "compliance-check",
        parameters:   { region: "US", docType: "quarterly-report" },
        timeoutMs:    10_000,
      });

      if (complianceProbe.accepted) {
        console.log(`[finance-agent] Compliance probe accepted! Sending compliance-check to Relay C...`);

        const complianceResult = await agent.send({
          to:          complianceAgentDid,
          capability:  "compliance-check",
          payload:     {
            summary:  String(summary?.summary ?? "Quarterly financial report summary"),
            docType:  "quarterly-report",
            region:   "US",
          },
          ttlMs:      60_000,
          timeoutMs:  30_000,
        });

        console.log("\n[finance-agent] ✓ Compliance check complete! (via Vercel Sandbox Relay C)");
        console.log("[finance-agent] Compliance result:");
        console.log(JSON.stringify(complianceResult, null, 2));
      } else {
        console.log("[finance-agent] Compliance probe rejected:", complianceProbe.rejectionReason);
      }
    } catch (err) {
      console.warn("[finance-agent] Compliance check skipped:", err);
    }

  } catch (err) {
    console.error("\n[finance-agent] ✗ Task failed:", err);
  }

  // ── Step 6: Listen for any incoming delegated tasks ──────────
  agent.on("task", async (envelope, respond) => {
    console.log(`[finance-agent] Received incoming task: ${JSON.stringify(envelope.payload, null, 2)}`);
    // Finance agent can also receive tasks (e.g. from a supervisor agent)
    await respond({ success: true, output: { message: "Acknowledged" } });
  });

  console.log("\n[finance-agent] Listening for incoming tasks (Ctrl+C to exit)...");
  await new Promise(() => {});   // Keep alive
}

main().catch(err => {
  console.error("[finance-agent] Fatal:", err);
  process.exit(1);
});
