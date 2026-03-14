"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Github } from "lucide-react";
import { AgentCard }   from "./AgentCard";
import { FlowDiagram } from "./FlowDiagram";
import { EventLog }    from "./EventLog";
import type { AgentState, FlowStep, LogEntry, RelayHealth } from "@/lib/types";
import {
  buildDemoContext,
  registerAgent,
  preregisterRemoteDid,
  subscribeSSE,
  dispatchInbound,
  runProbe,
  runTask,
  checkRelayHealth,
  type DemoContext,
} from "@/lib/aamp-client";

const RELAY_A = process.env.NEXT_PUBLIC_RELAY_A_URL ?? "http://localhost:8085";
const RELAY_B = process.env.NEXT_PUBLIC_RELAY_B_URL ?? "http://localhost:8086";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function Dashboard() {
  const [step,       setStep]       = useState<FlowStep>("idle");
  const [log,        setLog]        = useState<LogEntry[]>([]);
  const [financeAgent, setFinance]  = useState<AgentState | null>(null);
  const [relayA,     setRelayA]     = useState<RelayHealth>({ status: "checking" });
  const [relayB,     setRelayB]     = useState<RelayHealth>({ status: "checking" });
  const [running,    setRunning]    = useState(false);
  const [result,     setResult]     = useState<Record<string, unknown> | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const ctxRef   = useRef<DemoContext | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const addLog = useCallback((entry: Omit<LogEntry, "id">) => {
    setLog(prev => [...prev, { ...entry, id: uid() }]);
  }, []);

  const onStep = useCallback((s: FlowStep, entry: Omit<LogEntry, "id">) => {
    setStep(s);
    addLog(entry);
  }, [addLog]);

  // ── Health checks ───────────────────────────────────────────────────────────

  useEffect(() => {
    const check = async () => {
      try {
        const h = await checkRelayHealth(RELAY_A);
        setRelayA({ status: "ok", domain: h.domain, uptime: h.uptime });
      } catch {
        setRelayA({ status: "error" });
      }
      try {
        const h = await checkRelayHealth(RELAY_B);
        setRelayB({ status: "ok", domain: h.domain, uptime: h.uptime });
      } catch {
        setRelayB({ status: "error" });
      }
    };
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);

  // ── Auto-init Finance Agent on mount ────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setStep("registering");
        addLog({ timestamp: Date.now(), type: "SYSTEM", from: "Browser", to: "Relay A", label: "Generating Ed25519 keypair…" });

        const ctx = await buildDemoContext();
        if (cancelled) return;
        ctxRef.current = ctx;

        addLog({ timestamp: Date.now(), type: "SYSTEM", from: "Browser", to: "Relay A", label: `DID created: ${ctx.did.slice(0, 30)}…` });

        await registerAgent({
          relayUrl:     RELAY_A,
          agentId:      ctx.agentId,
          did:          ctx.did,
          domain:       ctx.domain,
          publicKeyB64: ctx.publicKeyB64,
          name:         "Finance Bot (Demo UI)",
          capabilities: [],
        });

        if (cancelled) return;

        // Pre-register Research Bot's DID doc so Relay A can federate
        await preregisterRemoteDid({
          relayUrl:       RELAY_A,
          remoteDid:      ctx.researchDid,
          remoteRelayUrl: RELAY_B,
        });

        setFinance({
          did:       ctx.did,
          agentId:   ctx.agentId,
          connected: true,
          relay:     RELAY_A,
          domain:    ctx.domain,
        });

        // Open SSE for incoming messages.
        // Also dispatch to any per-task handlers registered by runProbe/runTask
        // so they receive responses without needing a second SSE connection.
        unsubRef.current = subscribeSSE(RELAY_A, ctx.agentId, env => {
          dispatchInbound(env);
          addLog({
            timestamp: Date.now(),
            type:      env.messageType,
            from:      "Research Bot",
            to:        "Finance Bot",
            taskId:    env.taskId,
            messageId: env.messageId,
            label:     `Inbound: ${env.messageType}`,
            payload:   env.payload,
          });
        });

        addLog({ timestamp: Date.now(), type: "SYSTEM", from: "Relay A", to: "Finance Bot", label: "Agent registered · SSE stream open" });
        setStep("idle");
      } catch (e) {
        if (cancelled) return;
        setStep("error");
        setError(String(e));
        addLog({ timestamp: Date.now(), type: "ERROR", from: "System", to: "System", label: `Init failed: ${String(e)}` });
      }
    };
    init();
    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Run full demo ────────────────────────────────────────────────────────────

  const runDemo = useCallback(async () => {
    const ctx = ctxRef.current;
    if (!ctx || running) return;
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      // Probe
      onStep("probing", { timestamp: Date.now(), type: "SYSTEM", from: "Finance Bot", to: "Research Bot", label: "Starting PROBE negotiation…" });
      const accepted = await runProbe(ctx, onStep);

      if (!accepted) {
        onStep("error", { timestamp: Date.now(), type: "ERROR", from: "Relay", to: "Finance Bot", label: "PROBE rejected or timed out" });
        setError("Probe was rejected or timed out. Is the Research Agent running?");
        return;
      }

      // Task
      const taskResult = await runTask(ctx, onStep);
      setResult((taskResult as Record<string, unknown>) ?? null);
    } catch (e) {
      setStep("error");
      setError(String(e));
      addLog({ timestamp: Date.now(), type: "ERROR", from: "System", to: "System", label: `Demo failed: ${String(e)}` });
    } finally {
      setRunning(false);
    }
  }, [running, onStep, addLog]);

  const reset = useCallback(() => {
    setStep("idle");
    setLog([]);
    setResult(null);
    setError(null);
    setRunning(false);
  }, []);

  const researchAgentState: AgentState = {
    did:       `did:web:company-b.local:agents:research-bot-01`,
    agentId:   "research-bot-01",
    connected: relayB.status === "ok",
    relay:     RELAY_B,
    domain:    "company-b.local",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">AAMP</h1>
              <p className="text-[10px] text-zinc-400 leading-none">Agent-to-Agent Messaging Protocol</p>
            </div>
          </div>

          {/* Relay badges */}
          <div className="flex items-center gap-3">
            <RelayBadge label="Relay A" url={RELAY_A} health={relayA} />
            <RelayBadge label="Relay B" url={RELAY_B} health={relayB} />
            <a
              href="https://github.com/brainfish-ai/AAMP"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Github size={14} />
              <span className="hidden sm:inline">brainfish-ai/AAMP</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Cross-Company Message Flow</h2>
            <p className="text-sm text-zinc-400 mt-1">
              <span className="text-cyan-400 font-medium">Intra</span>: Finance Bot ↔ Research Bot via Cloudflare Workers (NATS federation)
              {" · "}
              <span className="text-amber-400 font-medium">Inter</span>: Finance Bot → Compliance Bot via Vercel Sandbox (cross-provider)
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              onClick={runDemo}
              disabled={running || !financeAgent?.connected || step === "registering"}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all shadow-lg shadow-blue-900/30"
            >
              <Play size={14} />
              {running ? "Running…" : "Run Full Demo"}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error !== null && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Agent cards + flow diagram */}
        <div className="grid grid-cols-[250px_1fr_250px] gap-4 items-start">
          <AgentCard
            label="Finance Bot"
            company="Company A"
            tech="TypeScript SDK"
            agent={financeAgent}
            relay={relayA}
            relayLabel={`Relay A — ${RELAY_A}`}
            side="left"
            isActive={["probing", "probe_sent", "task_sent", "probe_response", "task_response", "completed"].includes(step)}
          />

          <FlowDiagram step={step} />

          <AgentCard
            label="Research Bot"
            company="Company B"
            tech="Python SDK"
            agent={researchAgentState}
            relay={relayB}
            relayLabel={`Relay B — ${RELAY_B}`}
            side="right"
            capabilities={["summarize-pdf", "extract-tables", "classify-doc"]}
            isActive={["probe_delivered", "probe_response", "task_delivered", "task_processing", "task_response"].includes(step)}
          />
        </div>

        {/* Result panel */}
        {result !== null && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">Task Result from Research Bot</span>
            </div>
            {(() => {
              const r = result;
              const out = r.output as Record<string, unknown> | undefined;
              return out ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {out.summary != null && (
                    <div className="rounded-xl bg-black/30 p-4 border border-white/5 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Summary</p>
                      <p className="text-sm text-zinc-200 leading-relaxed">{String(out.summary)}</p>
                    </div>
                  )}
                  {Array.isArray(out.keyPoints) && (
                    <div className="rounded-xl bg-black/30 p-4 border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Key Points</p>
                      <ul className="space-y-1.5">
                        {(out.keyPoints as string[]).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {out.agentDid != null && (
                    <div className="rounded-xl bg-black/30 p-4 border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Processed By</p>
                      <p className="font-mono text-xs text-violet-300 break-all">{String(out.agentDid)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <pre className="text-xs font-mono text-zinc-300">{JSON.stringify(result, null, 2)}</pre>
              );
            })()}
          </div>
        )}

        {/* Event log */}
        <EventLog entries={log} />
      </main>
    </div>
  );
}

// ─── Relay badge ─────────────────────────────────────────────────────────────

function RelayBadge({ label, url, health }: { label: string; url: string; health: RelayHealth }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white/[0.03] border-white/10 text-xs">
      <div
        className={
          health.status === "ok"       ? "h-1.5 w-1.5 rounded-full bg-emerald-400" :
          health.status === "checking" ? "h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" :
                                         "h-1.5 w-1.5 rounded-full bg-red-500"
        }
      />
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-400 text-[10px]">{url.replace("http://", "")}</span>
    </div>
  );
}
