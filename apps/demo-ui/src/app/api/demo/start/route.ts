/**
 * POST /api/demo/start
 *
 * Spins up two Cloudflare Sandboxes:
 *   - Sandbox A: Finance Agent (Company A) — Node.js
 *   - Sandbox B: Research Agent (Company B) — Python
 *
 * Both agents are injected with the deployed relay URLs and Synadia NATS URL.
 * They communicate ONLY through the AAMP relay Workers — never directly.
 *
 * Returns a sessionId that the client uses to stream events from
 * GET /api/demo/stream?sessionId=<id>
 */

import { type NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSandbox } from "@cloudflare/sandbox";

export const runtime = "edge";

interface DemoEnv {
  SANDBOX:        DurableObjectNamespace;
  RELAY_A_URL:    string;
  RELAY_B_URL:    string;
  NATS_URL:       string;
  FINANCE_IMAGE?: string;   // optional pre-built Docker image tag
  RESEARCH_IMAGE?: string;  // optional pre-built Docker image tag
}

// In-process event buffer shared with the /stream route (same Worker instance).
// Key: sessionId, Value: array of log lines waiting to be streamed.
export const sessionLogs = new Map<string, string[]>();
export const sessionDone = new Map<string, boolean>();

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const { env } = getRequestContext<DemoEnv>();

  const sessionId = crypto.randomUUID();
  sessionLogs.set(sessionId, []);
  sessionDone.set(sessionId, false);

  const relayAUrl    = env.RELAY_A_URL    ?? "https://aamp-relay-a.workers.dev";
  const relayBUrl    = env.RELAY_B_URL    ?? "https://aamp-relay-b.workers.dev";
  const natsUrl      = env.NATS_URL       ?? "";
  const financeImage  = env.FINANCE_IMAGE  ?? "aampproject/finance-agent:latest";
  const researchImage = env.RESEARCH_IMAGE ?? "aampproject/research-agent:latest";

  // Fire-and-forget: run both sandboxes concurrently; stream logs to sessionLogs
  runDemo({ env, sessionId, relayAUrl, relayBUrl, natsUrl, financeImage, researchImage }).catch(err => {
    const logs = sessionLogs.get(sessionId) ?? [];
    logs.push(`[error] ${String(err)}`);
    sessionDone.set(sessionId, true);
  });

  return NextResponse.json({ sessionId });
}

async function runDemo(opts: {
  env:           DemoEnv;
  sessionId:     string;
  relayAUrl:     string;
  relayBUrl:     string;
  natsUrl:       string;
  financeImage:  string;
  researchImage: string;
}): Promise<void> {
  const { env, sessionId, relayAUrl, relayBUrl, natsUrl, financeImage, researchImage } = opts;

  function log(line: string): void {
    const logs = sessionLogs.get(sessionId);
    if (logs) logs.push(line);
  }

  try {
    log("[system] Starting Cloudflare Sandboxes...");

    const financeBox  = getSandbox(env.SANDBOX, `finance-${sessionId}`);
    const researchBox = getSandbox(env.SANDBOX, `research-${sessionId}`);

    // ── Launch both sandboxes concurrently ──────────────────────
    await Promise.all([
      (async () => {
        log("[system] Finance Agent sandbox starting (Company A)...");
        const result = await financeBox.exec(
          "node /app/examples/finance-agent/dist/index.js",
          {
            image: financeImage,
            env: {
              RELAY_A_URL:       relayAUrl,
              RELAY_B_URL:       relayBUrl,
              NATS_URL:          natsUrl,
              RESEARCH_AGENT_ID: "research-bot-01",
            },
            timeout: 120_000,
          },
        );
        for (const line of result.stdout.split("\n").filter(Boolean)) {
          log(line);
        }
        if (result.exitCode !== 0) {
          log(`[finance-agent] exited with code ${result.exitCode}`);
        }
      })(),

      (async () => {
        log("[system] Research Agent sandbox starting (Company B)...");
        // Give research agent a head start so it's listening before finance agent probes
        await sleep(2_000);
        const result = await researchBox.exec(
          "python /app/main.py",
          {
            image: researchImage,
            env: {
              RELAY_B_URL:   relayBUrl,
              NATS_URL:      natsUrl,
              RELAY_DOMAIN:  "company-b.aamp.workers.dev",
              AGENT_ID:      "research-bot-01",
            },
            timeout: 120_000,
          },
        );
        for (const line of result.stdout.split("\n").filter(Boolean)) {
          log(line);
        }
      })(),
    ]);
  } finally {
    log("[system] Demo complete.");
    sessionDone.set(sessionId, true);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
