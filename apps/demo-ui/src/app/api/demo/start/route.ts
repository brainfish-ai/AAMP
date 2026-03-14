/**
 * POST /api/demo/start
 *
 * Spins up THREE Vercel Sandboxes demonstrating AAMP cross-provider federation:
 *
 *   Provider A — Cloudflare Worker  (Relay A · public)
 *   Provider B — Cloudflare Worker  (Relay B · public)
 *   Provider C — Vercel Sandbox     (Relay C · Node.js, port exposed via sandbox.domain())
 *
 *   Sandbox 1 (node22):       Finance Agent     → Relay A (Cloudflare)
 *   Sandbox 2 (python3.13):   Research Agent    → Relay B (Cloudflare)
 *   Sandbox 3 (node22):       Node.js Relay C   + Compliance Agent
 *                             ↑ port 8087 exposed as public HTTPS URL
 *                             ↑ Finance Agent registers Compliance DID doc pointing here
 *                             ↑ Relay A federates messages to Relay C via HTTP /inbound
 *
 * Message flow:
 *   Finance(CF-A) ──NATS──▶ Research(CF-B)   [Cloudflare ↔ Cloudflare]
 *   Finance(CF-A) ──HTTP──▶ RelayC(Vercel) ──▶ Compliance(Vercel)  [CF ↔ Vercel Sandbox]
 *
 * Returns { sessionId } — used by GET /api/demo/stream to tail events.
 */

import { type NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { sessionLogs, sessionDone } from "@/lib/session-store";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const sessionId = crypto.randomUUID();
  sessionLogs.set(sessionId, []);
  sessionDone.set(sessionId, false);

  runDemo(sessionId).catch(err => {
    // Vercel Sandbox APIError carries .json and .text with the actual API response body
    const apiBody = (err as { json?: unknown; text?: string })?.json
      ?? (err as { text?: string })?.text;
    const detail = apiBody ? ` — API response: ${JSON.stringify(apiBody)}` : "";
    sessionLogs.get(sessionId)?.push(`[error] ${String(err)}${detail}`);
    sessionDone.set(sessionId, true);
  });

  return NextResponse.json({ sessionId });
}

async function runDemo(sessionId: string): Promise<void> {
  function log(line: string): void {
    sessionLogs.get(sessionId)?.push(line);
  }

  const relayAUrl      = process.env.RELAY_A_URL    ?? "https://aamp-relay-a.workers.dev";
  const relayBUrl      = process.env.RELAY_B_URL    ?? "https://aamp-relay-b.workers.dev";
  // Trim env values — Vercel's env storage can add a trailing newline; the Sandbox
  // API rejects env objects whose values contain embedded newlines (→ 400).
  const natsCreds      = (process.env.NATS_CREDS     ?? "").trim();
  const natsUrl        = (process.env.NATS_URL        ?? "").trim();
  const repoUrl        = (process.env.REPO_URL        ?? "").trim();
  const snapFinance    = process.env.VERCEL_SNAPSHOT_FINANCE;
  const snapResearch   = process.env.VERCEL_SNAPSHOT_RESEARCH;
  const snapCompliance = process.env.VERCEL_SNAPSHOT_COMPLIANCE;

  // Build a clean env map, omitting empty values so the Sandbox API doesn't reject them.
  function makeEnv(base: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.entries(base).filter(([, v]) => v.length > 0));
  }

  log("[system] Config: RELAY_A=" + relayAUrl);
  log("[system] Config: RELAY_B=" + relayBUrl);
  log("[system] Config: NATS_URL=" + natsUrl);
  log("[system] Config: REPO_URL=" + repoUrl);

  let financeBox:    Sandbox | null = null;
  let researchBox:   Sandbox | null = null;
  let complianceBox: Sandbox | null = null;

  try {
    log("[system] ══════════════════════════════════════════════════");
    log("[system] AAMP Cross-Provider Federation Demo");
    log("[system] Provider A: Cloudflare Workers   (Relay A)");
    log("[system] Provider B: Cloudflare Workers   (Relay B)");
    log("[system] Provider C: Vercel Sandbox       (Relay C — Node.js)");
    log("[system] ══════════════════════════════════════════════════");

    // ── Sandbox C: Relay C (Node.js) + Compliance Agent ─────────────────
    // Boot first — needs to expose port and get public URL before Finance starts
    log("[system] Booting Sandbox C — Node.js Relay + Compliance Agent (Vercel Sandbox)...");

    const complianceEnv = makeEnv({
      NATS_URL: natsUrl, NATS_CREDS: natsCreds,
      RELAY_DOMAIN: "company-b.sandbox", RELAY_PORT: "8087",
      AGENT_ID: "compliance-bot-01",
    });
    log("[system] Compliance env keys: " + Object.keys(complianceEnv).join(", "));

    complianceBox = await Sandbox.create(
      snapCompliance
        ? { source: { type: "snapshot", snapshotId: snapCompliance }, timeout: 120_000,
            ports: [8087], env: complianceEnv }
        : { runtime: "node22",
            source: repoUrl ? { type: "git", url: repoUrl, revision: "feat/cloudflare-deploy" } : undefined,
            timeout: 120_000,
            ports: [8087],
            env: complianceEnv },
    );

    // Get public URL for Relay C — Cloudflare Workers can reach this!
    const relayCPublicUrl = complianceBox.domain(8087);
    log(`[compliance-relay] Public URL: ${relayCPublicUrl}`);
    log(`[compliance-relay] Provider: Vercel Sandbox (Node.js) — port 8087 exposed`);

    // Write NATS credentials to a temp file — pre-built bundles read from NATS_CREDS_FILE
    // to avoid multiline env var truncation in the Sandbox API.
    if (natsCreds) {
      const credsB64 = Buffer.from(natsCreds).toString("base64");
      await complianceBox.runCommand({
        cmd:  "bash",
        args: ["-c", `echo '${credsB64}' | base64 -d > /tmp/nats.creds && chmod 600 /tmp/nats.creds`],
        cwd:  "/vercel/sandbox",
      });
      log("[compliance-relay] NATS creds written to /tmp/nats.creds");
    }

    // Start pre-bundled Node.js Relay C (no tsx / pnpm deps needed — esbuild bundle)
    log("[compliance-relay] Starting Relay C (pre-built bundle)...");
    await complianceBox.runCommand({
      cmd:      "node",
      args:     ["packages/relay/relay-node-bundle.cjs"],
      cwd:      "/vercel/sandbox",
      detached: true,
      env:      makeEnv({
        RELAY_PUBLIC_URL:  relayCPublicUrl,
        RELAY_DOMAIN:      "company-c.sandbox",
        RELAY_PORT:        "8087",
        NATS_URL:          natsUrl,
        NATS_CREDS_FILE:   natsCreds ? "/tmp/nats.creds" : "",
        RELAY_STREAM_NAME: "AAMP_MESSAGES_C",
      }),
    });

    await sleep(3_000);
    log("[compliance-relay] Relay C online ✓");

    // Start pre-bundled Compliance Agent (no tsx / pnpm deps needed — esbuild bundle)
    const complianceCmd = await complianceBox.runCommand({
      cmd:      "node",
      args:     ["examples/compliance-agent/compliance-bundle.cjs"],
      cwd:      "/vercel/sandbox",
      detached: true,
      env:      makeEnv({
        RELAY_C_URL:     "http://localhost:8087",
        NATS_URL:        natsUrl,
        NATS_CREDS_FILE: natsCreds ? "/tmp/nats.creds" : "",
        RELAY_DOMAIN:    "company-c.sandbox",
        AGENT_ID:        "compliance-bot-01",
      }),
    });

    log("[compliance-agent] Online — waiting for compliance-check tasks via Relay C (Vercel)");
    await sleep(2_000);

    // ── Sandbox B: Research Agent ────────────────────────────────────────
    log("[system] Booting Sandbox B — Research Agent (Cloudflare Relay B)...");

    researchBox = await Sandbox.create(
      snapResearch
        ? { source: { type: "snapshot", snapshotId: snapResearch }, timeout: 120_000,
            env: makeEnv({ RELAY_B_URL: relayBUrl, NATS_URL: natsUrl, NATS_CREDS: natsCreds,
                   RELAY_DOMAIN: "company-a.aamp.workers.dev", AGENT_ID: "research-bot-01" }) }
        : { runtime: "python3.13",
            source: repoUrl ? { type: "git", url: repoUrl, revision: "feat/cloudflare-deploy" } : undefined,
            timeout: 120_000,
            env: makeEnv({ RELAY_B_URL: relayBUrl, NATS_URL: natsUrl, NATS_CREDS: natsCreds,
                   RELAY_DOMAIN: "company-a.aamp.workers.dev", AGENT_ID: "research-bot-01" }) },
    );

    // Write NATS creds for research sandbox
    if (natsCreds) {
      const credsB64 = Buffer.from(natsCreds).toString("base64");
      await researchBox.runCommand({
        cmd:  "bash",
        args: ["-c", `echo '${credsB64}' | base64 -d > /tmp/nats.creds && chmod 600 /tmp/nats.creds`],
        cwd:  "/vercel/sandbox",
      });
    }

    if (!snapResearch) {
      log("[research-agent] Installing Python runtime dependencies (nats-py, aiohttp, etc.)...");
      // Install only external deps — aamp_sdk is loaded via PYTHONPATH (no pip install needed)
      await researchBox.runCommand("pip", [
        "install", "--quiet",
        "nats-py>=2.9.0", "cryptography>=43.0.0", "aiohttp>=3.11.0", "pydantic>=2.10.0",
      ]);
    }

    const researchCmd = await researchBox.runCommand({
      cmd:      "python",
      args:     ["examples/research-agent/main.py"],
      cwd:      "/vercel/sandbox",
      detached: true,
      env:      makeEnv({
        RELAY_B_URL:     relayBUrl,
        NATS_URL:        natsUrl,
        NATS_CREDS_FILE: natsCreds ? "/tmp/nats.creds" : "",
        PYTHONPATH:      "/vercel/sandbox/packages/sdk-py",
      }),
    });

    log("[research-agent] Online — waiting for tasks via Relay B (Cloudflare)");
    await sleep(4_000);

    // ── Sandbox A: Finance Agent ─────────────────────────────────────────
    log("[system] Booting Sandbox A — Finance Agent (Cloudflare Relay A)...");
    // Pass the REAL public URL for Relay C so Relay A can federate to it via HTTP
    log(`[system] Relay C public URL injected into Finance Agent: ${relayCPublicUrl}`);

    financeBox = await Sandbox.create(
      snapFinance
        ? { source: { type: "snapshot", snapshotId: snapFinance }, timeout: 120_000,
            env: makeEnv({ RELAY_A_URL: relayAUrl, RELAY_B_URL: relayBUrl,
                   RELAY_C_URL: relayCPublicUrl, NATS_URL: natsUrl, NATS_CREDS: natsCreds }) }
        : { runtime: "node22",
            source: repoUrl ? { type: "git", url: repoUrl, revision: "feat/cloudflare-deploy" } : undefined,
            timeout: 120_000,
            env: makeEnv({ RELAY_A_URL: relayAUrl, RELAY_B_URL: relayBUrl,
                   RELAY_C_URL: relayCPublicUrl, NATS_URL: natsUrl, NATS_CREDS: natsCreds }) },
    );

    // Write NATS creds for finance sandbox
    if (natsCreds) {
      const credsB64 = Buffer.from(natsCreds).toString("base64");
      await financeBox.runCommand({
        cmd:  "bash",
        args: ["-c", `echo '${credsB64}' | base64 -d > /tmp/nats.creds && chmod 600 /tmp/nats.creds`],
        cwd:  "/vercel/sandbox",
      });
    }

    log("[system] ✓ All 3 providers online. Initiating cross-provider AAMP protocol flow...");
    log("[system] Finance(Vercel) → Research(Cloudflare) → Compliance(Vercel Sandbox)");

    // Run pre-built bundle — no pnpm install or build step needed
    const financeCmd = await financeBox.runCommand({
      cmd:      "node",
      args:     ["examples/finance-agent/finance-bundle.cjs"],
      cwd:      "/vercel/sandbox",
      detached: true,
      env:      makeEnv({
        RELAY_A_URL:     relayAUrl,
        RELAY_B_URL:     relayBUrl,
        RELAY_C_URL:     relayCPublicUrl,
        NATS_URL:        natsUrl,
        NATS_CREDS_FILE: natsCreds ? "/tmp/nats.creds" : "",
      }),
    });

    // Stream logs from all three concurrently
    await Promise.all([
      streamLogs(financeCmd,    log),
      streamLogs(researchCmd,   log),
      streamLogs(complianceCmd, log),
    ]);

    // Snapshot all three on first run for fast reruns
    if (!snapFinance || !snapResearch || !snapCompliance) {
      log("[system] Creating snapshots for faster future runs...");
      await Promise.allSettled([
        financeBox.snapshot().then(s    => log(`[system] Finance snapshot:    ${s.snapshotId}`)).catch(() => {}),
        researchBox.snapshot().then(s   => log(`[system] Research snapshot:   ${s.snapshotId}`)).catch(() => {}),
        complianceBox.snapshot().then(s => log(`[system] Compliance snapshot: ${s.snapshotId}`)).catch(() => {}),
      ]);
      log("[system] Add snapshot IDs to Vercel env vars for ~10s restarts:");
      log("[system]   VERCEL_SNAPSHOT_FINANCE / VERCEL_SNAPSHOT_RESEARCH / VERCEL_SNAPSHOT_COMPLIANCE");
    }
  } finally {
    log("[system] Demo complete. Stopping all sandboxes...");
    await Promise.allSettled([
      financeBox?.stop(),
      researchBox?.stop(),
      complianceBox?.stop(),
    ]);
    sessionDone.set(sessionId, true);
  }
}

async function streamLogs(
  command: { logs(): AsyncIterable<{ data: string }> },
  log: (line: string) => void,
): Promise<void> {
  try {
    for await (const entry of command.logs()) {
      const line = entry.data.trimEnd();
      if (line) log(line);
    }
  } catch {
    // Non-fatal — sandbox may have stopped
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
