/**
 * Compliance Agent — Company C (Vercel Sandbox)
 *
 * Demonstrates AAMP cross-provider federation:
 *   - This agent runs inside a Vercel Sandbox microVM
 *   - It connects to Relay C (a Node.js AAMP relay running in the same sandbox)
 *   - Relay C connects to the same NATS cluster as Relay A (Cloudflare) and Relay B (Cloudflare)
 *   - Requests from Finance Agent (via Relay A) and Research Agent (via Relay B) are
 *     federated through NATS to Relay C, which delivers them to this agent
 *
 * Capabilities:
 *   - compliance-check: Validates a financial document against regulatory rules
 *
 * Provider: Vercel Sandbox (company-c.sandbox)
 */

import { AampAgent, generateKeyPair, createDidKey, TaskStatus } from "@aamp/sdk";

const RELAY_C_URL  = process.env.RELAY_C_URL  ?? "http://localhost:8087";
const NATS_URL     = process.env.NATS_URL      ?? "wss://connect.ngs.global";
const NATS_CREDS   = process.env.NATS_CREDS;
const AGENT_ID     = process.env.AGENT_ID      ?? "compliance-bot-01";
const DOMAIN       = process.env.RELAY_DOMAIN  ?? "company-c.sandbox";

async function main() {
  const keypair = await generateKeyPair();
  const did     = createDidKey(keypair.publicKey);

  console.log(`[compliance-agent] Provider: Vercel Sandbox`);
  console.log(`[compliance-agent] Domain: ${DOMAIN}`);
  console.log(`[compliance-agent] Identity: ${did}`);
  console.log(`[compliance-agent] Connecting to Relay C at ${RELAY_C_URL}...`);

  const agent = new AampAgent({
    did,
    privateKey:   keypair.privateKey,
    relayUrl:     RELAY_C_URL,
    natsUrl:      NATS_URL,
    natsCreds:    NATS_CREDS,
    name:         "Compliance Bot 01",
    domain:       DOMAIN,
    agentId:      AGENT_ID,
    capabilities: [
      {
        id:          "compliance-check",
        name:        "Regulatory Compliance Checker",
        description: "Validates financial documents and summaries against regulatory rules (SOX, GDPR, SEC guidelines)",
        parameters: {
          summary:  { type: "string",  description: "Document summary to validate" },
          docType:  { type: "string",  description: "Document type (annual-report, quarterly-report, etc.)" },
          region:   { type: "string",  description: "Regulatory region (US, EU, AU)", default: "US" },
        },
      },
    ],
  });

  await agent.connect();
  console.log(`[compliance-agent] Connected to Relay C (Vercel Sandbox). Waiting for compliance-check requests...`);
  console.log(`[compliance-agent] Provider: Vercel Sandbox | Relay: Node.js | Transport: NATS JetStream`);

  // Handle PROBE — respond with capability acceptance
  agent.on("probe", async (envelope, respond) => {
    console.log(`[compliance-agent] PROBE received for capability: ${JSON.stringify(envelope.payload)}`);
    const capId = (envelope.payload as Record<string, unknown>)?.capabilityId as string;

    if (capId === "compliance-check") {
      console.log(`[compliance-agent] Probe accepted — capability ${capId} available`);
      await respond({
        accepted:            true,
        estimatedLatencyMs:  500,
        costEstimate:        { maxUnits: 1, unit: "compliance-check" },
      });
    } else {
      console.log(`[compliance-agent] Probe rejected — unknown capability: ${capId}`);
      await respond({ accepted: false, rejectionReason: `Unknown capability: ${capId}` });
    }
  });

  // Handle TASK — run compliance check
  agent.on("task", async (envelope, respond) => {
    const payload = envelope.payload as Record<string, unknown>;
    console.log(`[compliance-agent] TASK received: compliance-check`);
    console.log(`[compliance-agent] Payload: ${JSON.stringify(payload, null, 2)}`);

    const summary = String(payload.summary ?? "");
    const docType = String(payload.docType ?? "financial-document");
    const region  = String(payload.region  ?? "US");

    // Simulate compliance check (100-300ms)
    await sleep(100 + Math.random() * 200);

    // Mock compliance rules
    const issues: string[] = [];
    const passed: string[] = [];

    if (summary.toLowerCase().includes("revenue")) {
      passed.push("Revenue disclosure: compliant with SEC Reg S-K");
    }
    if (summary.toLowerCase().includes("expense")) {
      passed.push("Expense disclosure: compliant with GAAP requirements");
    }
    if (summary.toLowerCase().includes("guidance")) {
      const forwardLooking = summary.toLowerCase().includes("forward-looking") ||
                             summary.toLowerCase().includes("safe harbor");
      if (!forwardLooking) {
        issues.push("Forward-looking statements should include safe harbor disclaimer");
      } else {
        passed.push("Forward-looking statements: safe harbor disclaimer present");
      }
    }

    const overallStatus = issues.length === 0 ? "COMPLIANT" : "COMPLIANT_WITH_WARNINGS";

    const result = {
      complianceStatus: overallStatus,
      region,
      docType,
      checkedAt:        new Date().toISOString(),
      agentDid:         did,
      provider:         "Vercel Sandbox (company-c.sandbox)",
      rules: {
        passed,
        warnings: issues,
        failed:   [],
      },
      attestation: `Compliance check performed by ${did} on Vercel Sandbox. Status: ${overallStatus}`,
    };

    console.log(`[compliance-agent] ✓ Compliance check complete: ${overallStatus}`);
    console.log(`[compliance-agent] Passed: ${passed.length}, Warnings: ${issues.length}`);

    await respond({ success: true, output: result });
  });

  // Keep alive
  console.log("[compliance-agent] Ready. Listening for tasks (AAMP cross-provider federation)...");
  await new Promise(() => {});
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error("[compliance-agent] Fatal:", err);
  process.exit(1);
});
