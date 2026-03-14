"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Github, Terminal } from "lucide-react";
import { AgentCard }   from "./AgentCard";
import { FlowDiagram } from "./FlowDiagram";
import { EventLog }    from "./EventLog";
import type { AgentState, FlowStep, LogEntry, RelayHealth } from "@/lib/types";
import { checkRelayHealth } from "@/lib/aamp-client";
import { cn } from "@/lib/utils";

const RELAY_A = process.env.NEXT_PUBLIC_RELAY_A_URL ?? "http://localhost:8085";
const RELAY_B = process.env.NEXT_PUBLIC_RELAY_B_URL ?? "http://localhost:8086";

function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Parse a raw sandbox stdout line into a log entry ────────────────────────

function parseLine(raw: string): Omit<LogEntry, "id"> {
  const line = raw.replace(/^\[(\d{4}-\d{2}-\d{2}[T ][^\]]*)\]\s*/, ""); // strip timestamp prefix

  let from = "System";
  let to   = "—";
  let type: LogEntry["type"] = "SYSTEM";

  if (raw.includes("[finance-agent]"))   { from = "Finance Bot";    to = "Relay A";      }
  else if (raw.includes("[research-agent]")) { from = "Research Bot"; to = "Relay B";    }
  else if (raw.includes("[compliance-agent]")) { from = "Compliance Bot"; to = "Relay C"; }
  else if (raw.includes("[compliance-relay]") || raw.includes("[relay-node]")) {
    from = "Relay C"; to = "—";
  }
  else if (raw.includes("[nats]")) { from = "NATS"; to = "—"; }

  if (raw.includes("[error]") || raw.toLowerCase().includes("fatal") || raw.toLowerCase().includes("error")) {
    type = "ERROR";
  } else if (raw.includes("PROBE"))    { type = "PROBE"; }
  else if (raw.includes("RESPONSE"))   { type = "RESPONSE"; }
  else if (raw.includes("TASK") || raw.includes("task")) { type = "TASK"; }

  return {
    timestamp: Date.now(),
    type,
    from,
    to,
    label: line.replace(/^\[[^\]]+\]\s*/, "").slice(0, 160),
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [step,    setStep]    = useState<FlowStep>("idle");
  const [log,     setLog]     = useState<LogEntry[]>([]);
  const [relayA,  setRelayA]  = useState<RelayHealth>({ status: "checking" });
  const [relayB,  setRelayB]  = useState<RelayHealth>({ status: "checking" });
  const [relayC,  setRelayC]  = useState<RelayHealth>({ status: "checking" });
  const [running, setRunning] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [rawLogs, setRawLogs] = useState<string[]>([]);
  const [showRaw, setShowRaw] = useState(false);
  const sseRef    = useRef<EventSource | null>(null);
  const rawEndRef = useRef<HTMLDivElement | null>(null);

  const addLog = useCallback((entry: Omit<LogEntry, "id">) => {
    setLog(prev => [...prev, { ...entry, id: uid() }]);
  }, []);

  // ── Health checks (Relay A & B are static CF Workers) ──────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const h = await checkRelayHealth(RELAY_A);
        setRelayA({ status: "ok", domain: h.domain, uptime: h.uptime });
      } catch { setRelayA({ status: "error" }); }
      try {
        const h = await checkRelayHealth(RELAY_B);
        setRelayB({ status: "ok", domain: h.domain, uptime: h.uptime });
      } catch { setRelayB({ status: "error" }); }
    };
    check();
    const id = setInterval(check, 15_000);
    return () => clearInterval(id);
  }, []);

  // Relay C is ephemeral — show ok when compliance sandbox is active
  useEffect(() => {
    const complianceActive = [
      "compliance_probing", "compliance_probe_response",
      "compliance_task_sent", "compliance_processing",
      "compliance_done", "completed",
    ].includes(step);
    setRelayC(complianceActive
      ? { status: "ok", domain: "company-c.sandbox" }
      : running ? { status: "checking" } : { status: "checking" });
  }, [step, running]);

  // ── Run Full Demo (server-side Vercel Sandboxes) ─────────────────────────
  const runDemo = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setLog([]);
    setRawLogs([]);
    setStep("registering");
    sseRef.current?.close();

    try {
      const res = await fetch("/api/demo/start", { method: "POST" });
      if (!res.ok) throw new Error(`Failed to start demo: ${res.statusText}`);
      const { sessionId } = await res.json() as { sessionId: string };

      addLog({ timestamp: Date.now(), type: "SYSTEM", from: "System", to: "Vercel", label: `Demo session started — booting 3 Vercel Sandboxes (sessionId: ${sessionId})` });

      const es = new EventSource(`/api/demo/stream?sessionId=${sessionId}`);
      sseRef.current = es;

      es.addEventListener("connected", () => {
        addLog({ timestamp: Date.now(), type: "SYSTEM", from: "Stream", to: "UI", label: "SSE stream connected — waiting for sandbox output…" });
      });

      es.addEventListener("log", (e: MessageEvent) => {
        const { line } = JSON.parse(e.data) as { line: string };
        if (!line.trim()) return;
        setRawLogs(prev => [...prev, line]);
        setLog(prev => [...prev, { ...parseLine(line), id: uid() }]);
      });

      es.addEventListener("step", (e: MessageEvent) => {
        const { step: s } = JSON.parse(e.data) as { step: string };
        setStep(s as FlowStep);
      });

      es.addEventListener("done", () => {
        setRunning(false);
        setStep(prev =>
          ["compliance_done", "completed"].includes(prev) ? "completed" : prev === "idle" ? "completed" : prev
        );
        addLog({ timestamp: Date.now(), type: "SYSTEM", from: "System", to: "UI", label: "✓ Demo complete — all sandboxes stopped" });
        es.close();
      });

      es.addEventListener("error", (e: MessageEvent) => {
        const msg = e.data ? (JSON.parse(e.data) as { message: string }).message : "Stream error";
        setError(msg);
        setRunning(false);
        setStep("error");
        es.close();
      });

      es.onerror = () => {
        if (running) {
          setRunning(false);
          setStep("error");
          setError("SSE connection lost");
        }
        es.close();
      };
    } catch (e) {
      setRunning(false);
      setStep("error");
      setError(String(e));
    }
  }, [running, addLog]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    sseRef.current?.close();
    setStep("idle");
    setLog([]);
    setRawLogs([]);
    setError(null);
    setRunning(false);
    setRelayC({ status: "checking" });
  }, []);

  useEffect(() => () => sseRef.current?.close(), []);

  // Auto-scroll raw log
  useEffect(() => {
    rawEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawLogs]);

  // ── Derive agent connection state from flow step ──────────────────────────
  const financeActive = ["probing","probe_sent","probe_federated","probe_delivered","probe_response",
    "task_sent","task_federated","task_delivered","task_processing","task_response","research_done",
    "compliance_probing","compliance_probe_response","compliance_task_sent","compliance_done","completed"].includes(step);

  const researchActive = ["probe_delivered","probe_response","task_delivered","task_processing","task_response","research_done"].includes(step);

  const complianceActive = ["compliance_probe_response","compliance_task_sent","compliance_processing","compliance_done","completed"].includes(step);

  const financeAgent: AgentState = {
    did:       running || step !== "idle" ? "did:key:…(sandbox)" : "—",
    agentId:   "finance-bot-01",
    connected: relayA.status === "ok" && (running || financeActive),
    relay:     RELAY_A,
    domain:    "company-a.aamp",
  };

  const researchAgent: AgentState = {
    did:       `did:web:company-b.aamp:agents:research-bot-01`,
    agentId:   "research-bot-01",
    connected: relayB.status === "ok",
    relay:     RELAY_B,
    domain:    "company-b.aamp",
  };

  const complianceAgent: AgentState = {
    did:       complianceActive ? "did:key:…(sandbox)" : "—",
    agentId:   "compliance-bot-01",
    connected: complianceActive,
    relay:     "Vercel Sandbox :8087",
    domain:    "company-c.sandbox",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">AAMP</h1>
            <p className="text-[10px] text-zinc-400 leading-none">Agent-to-Agent Messaging Protocol</p>
          </div>
          <div className="flex items-center gap-3">
            <RelayBadge label="Relay A" url={RELAY_A} health={relayA} />
            <RelayBadge label="Relay B" url={RELAY_B} health={relayB} />
            <RelayBadge label="Relay C" url="Vercel Sandbox" health={relayC} />
            <a href="https://github.com/brainfish-ai/AAMP" target="_blank" rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
              <Github size={14} />
              <span className="hidden sm:inline">brainfish-ai/AAMP</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 flex flex-col gap-6">

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
            <button onClick={() => setShowRaw(v => !v)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all",
                showRaw ? "border-amber-500/50 text-amber-300 bg-amber-500/10" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500")}>
              <Terminal size={13} />
              Logs
            </button>
            <button onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
              <RotateCcw size={13} />
              Reset
            </button>
            <button onClick={runDemo} disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all shadow-lg shadow-blue-900/30">
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

        {/* ── Agent cards + flow diagram ─────────────────────────────────── */}
        {/*
          Layout:
            [Finance Bot (A)]  [FlowDiagram]  [Research Bot (B)]
                                              [Compliance Bot (C)]
        */}
        <div className="grid grid-cols-[220px_1fr_220px] gap-4 items-start">

          {/* Left — Company A */}
          <AgentCard
            label="Finance Bot"
            company="Company A · Intra"
            tech="TypeScript SDK"
            agent={financeAgent}
            relay={relayA}
            relayLabel={`Relay A — ${RELAY_A}`}
            side="left"
            accent="blue"
            isActive={financeActive}
          />

          {/* Center — Flow diagram */}
          <FlowDiagram step={step} />

          {/* Right — Company B + Company C stacked */}
          <div className="flex flex-col gap-4">
            <AgentCard
              label="Research Bot"
              company="Company B · Intra"
              tech="Python SDK"
              agent={researchAgent}
              relay={relayB}
              relayLabel={`Relay B — ${RELAY_B}`}
              side="right"
              accent="violet"
              capabilities={["summarize-pdf", "extract-tables", "classify-doc"]}
              isActive={researchActive}
            />
            <AgentCard
              label="Compliance Bot"
              company="Company C · Inter"
              tech="TypeScript SDK"
              agent={complianceAgent}
              relay={relayC}
              relayLabel="Relay C — Vercel Sandbox"
              side="right"
              accent="amber"
              capabilities={["compliance-check"]}
              isActive={complianceActive}
            />
          </div>
        </div>

        {/* Raw sandbox log (collapsible) */}
        {showRaw && (
          <div className="rounded-2xl border border-amber-500/20 bg-black/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/40">
              <Terminal size={12} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">Sandbox stdout</span>
              <span className="ml-auto text-[10px] text-zinc-500">{rawLogs.length} lines</span>
            </div>
            <div className="h-64 overflow-y-auto p-4 font-mono text-[11px] text-zinc-300 space-y-0.5">
              {rawLogs.length === 0 ? (
                <p className="text-zinc-600 italic">No output yet — click Run Full Demo to start</p>
              ) : (
                rawLogs.map((line, i) => (
                  <div key={i} className={cn("leading-relaxed whitespace-pre-wrap break-all",
                    line.includes("[error]") || line.toLowerCase().includes("fatal") ? "text-red-400" :
                    line.includes("[finance-agent]") ? "text-cyan-300" :
                    line.includes("[research-agent]") ? "text-violet-300" :
                    line.includes("[compliance-agent]") ? "text-amber-300" :
                    line.includes("[relay-node]") || line.includes("[compliance-relay]") ? "text-amber-400/70" :
                    line.includes("[system]") ? "text-zinc-400" :
                    "text-zinc-500"
                  )}>
                    {line}
                  </div>
                ))
              )}
              <div ref={rawEndRef} />
            </div>
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
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white/3 border-white/10 text-xs">
      <div className={
        health.status === "ok"       ? "h-1.5 w-1.5 rounded-full bg-emerald-400" :
        health.status === "checking" ? "h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" :
                                       "h-1.5 w-1.5 rounded-full bg-red-500"
      } />
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-400 text-[10px]">{url.replace("https://", "").replace("http://", "").slice(0, 30)}</span>
    </div>
  );
}
