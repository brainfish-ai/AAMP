/**
 * POST /api/demo/start
 *
 * Spins up two Vercel Sandboxes to run the real agent code:
 *   - Sandbox A: Finance Agent (Company A) — node22 runtime
 *   - Sandbox B: Research Agent (Company B) — python3.13 runtime
 *
 * Both sandboxes clone the AAMP repo, install dependencies, and run
 * their respective agents. They communicate ONLY through the deployed
 * Cloudflare relay Workers — zero direct contact between sandboxes.
 *
 * Snapshot caching: after the first run, snapshots of the pre-built
 * sandbox states are saved. Subsequent demo runs restore from those
 * snapshots, skipping the slow pnpm install + build step.
 *
 * Returns { sessionId } — used by GET /api/demo/stream to tail events.
 */

import { type NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";

export const maxDuration = 120;

// In-process session state shared with /api/demo/stream (same serverless instance).
// For production scale, back this with Vercel KV instead.
export const sessionLogs = new Map<string, string[]>();
export const sessionDone = new Map<string, boolean>();

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const sessionId = crypto.randomUUID();
  sessionLogs.set(sessionId, []);
  sessionDone.set(sessionId, false);

  // Fire and forget — stream route polls sessionLogs independently
  runDemo(sessionId).catch(err => {
    sessionLogs.get(sessionId)?.push(`[error] ${String(err)}`);
    sessionDone.set(sessionId, true);
  });

  return NextResponse.json({ sessionId });
}

async function runDemo(sessionId: string): Promise<void> {
  function log(line: string): void {
    sessionLogs.get(sessionId)?.push(line);
  }

  const relayAUrl    = process.env.RELAY_A_URL    ?? "https://aamp-relay-a.workers.dev";
  const relayBUrl    = process.env.RELAY_B_URL    ?? "https://aamp-relay-b.workers.dev";
  const natsUrl      = process.env.NATS_URL       ?? "";
  const repoUrl      = process.env.REPO_URL       ?? "";
  const snapFinance  = process.env.VERCEL_SNAPSHOT_FINANCE;
  const snapResearch = process.env.VERCEL_SNAPSHOT_RESEARCH;

  let financeBox:  Sandbox | null = null;
  let researchBox: Sandbox | null = null;

  try {
    log("[system] Creating Vercel Sandboxes...");

    // ── Research Agent sandbox (Company B) ────────────────────────────────
    // Start first so it's listening before the finance agent probes.
    log("[system] Booting Research Agent sandbox (python3.13, Company B)...");

    researchBox = await Sandbox.create(
      snapResearch
        ? { source: { type: "snapshot", snapshotId: snapResearch }, timeout: 120_000,
            env: { RELAY_B_URL: relayBUrl, NATS_URL: natsUrl,
                   RELAY_DOMAIN: "company-b.aamp.workers.dev", AGENT_ID: "research-bot-01" } }
        : { runtime: "python3.13",
            source: repoUrl ? { type: "git", url: repoUrl } : undefined,
            timeout: 120_000,
            env: { RELAY_B_URL: relayBUrl, NATS_URL: natsUrl,
                   RELAY_DOMAIN: "company-b.aamp.workers.dev", AGENT_ID: "research-bot-01" } },
    );

    if (!snapResearch) {
      log("[research-agent] Installing Python dependencies...");
      await researchBox.runCommand("pip", [
        "install", "--quiet",
        "-r", "packages/sdk-py/requirements.txt",
        "-r", "examples/research-agent/requirements.txt",
      ]);
    }

    // Start research agent detached — it listens indefinitely for tasks
    const researchCmd = await researchBox.runCommand({
      cmd:      "python",
      args:     ["examples/research-agent/main.py"],
      cwd:      "/vercel/sandbox",
      detached: true,
    });

    log("[research-agent] Ready. Listening for PROBE/TASK messages...");

    // Give the research agent a head start before finance agent probes
    await sleep(3_000);

    // ── Finance Agent sandbox (Company A) ─────────────────────────────────
    log("[system] Booting Finance Agent sandbox (node22, Company A)...");

    financeBox = await Sandbox.create(
      snapFinance
        ? { source: { type: "snapshot", snapshotId: snapFinance }, timeout: 120_000,
            env: { RELAY_A_URL: relayAUrl, RELAY_B_URL: relayBUrl, NATS_URL: natsUrl } }
        : { runtime: "node22",
            source: repoUrl ? { type: "git", url: repoUrl } : undefined,
            timeout: 120_000,
            env: { RELAY_A_URL: relayAUrl, RELAY_B_URL: relayBUrl, NATS_URL: natsUrl } },
    );

    if (!snapFinance) {
      log("[finance-agent] Installing dependencies (pnpm)...");
      await financeBox.runCommand("corepack", ["enable"]);
      await financeBox.runCommand("pnpm", ["install", "--frozen-lockfile"]);

      log("[finance-agent] Building packages...");
      await financeBox.runCommand("pnpm", ["--filter", "@aamp/core",     "build"]);
      await financeBox.runCommand("pnpm", ["--filter", "@aamp/identity", "build"]);
      await financeBox.runCommand("pnpm", ["--filter", "@aamp/sdk",      "build"]);
      await financeBox.runCommand("pnpm", ["--filter", "@aamp/example-finance-agent", "build"]);
    }

    log("[system] Both agents ready. Starting AAMP protocol flow...");

    // Run the finance agent (probe → task → response → exit)
    const financeCmd = await financeBox.runCommand({
      cmd:      "node",
      args:     ["examples/finance-agent/dist/index.js"],
      cwd:      "/vercel/sandbox",
      detached: true,
    });

    // Stream logs from both agents concurrently into sessionLogs
    await Promise.all([
      streamLogs(financeCmd,  log),
      streamLogs(researchCmd, log),
    ]);

    // On first run (no snapshots yet), create them for fast subsequent runs
    if (!snapFinance || !snapResearch) {
      log("[system] Creating snapshots for faster future runs...");
      await Promise.allSettled([
        financeBox.snapshot().then(s  => log(`[system] Finance snapshot: ${s.snapshotId}`)).catch(() => {}),
        researchBox.snapshot().then(s => log(`[system] Research snapshot: ${s.snapshotId}`)).catch(() => {}),
      ]);
    }
  } finally {
    log("[system] Demo complete. Stopping sandboxes...");
    await Promise.allSettled([
      financeBox?.stop(),
      researchBox?.stop(),
    ]);
    sessionDone.set(sessionId, true);
  }
}

async function streamLogs(
  command: Awaited<ReturnType<Sandbox["runCommand"]>>,
  log: (line: string) => void,
): Promise<void> {
  try {
    for await (const entry of command.logs()) {
      const line = entry.data.trimEnd();
      if (line) log(line);
    }
  } catch {
    // Sandbox stopped or stream ended — non-fatal
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
