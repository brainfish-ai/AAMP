"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeProps,
  MarkerType,
  ConnectionLineType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Active edges per step ────────────────────────────────────────────────────

const STEP_EDGES: Record<FlowStep, string[]> = {
  idle:              [],
  registering:       ["e-fa-ra"],
  probing:           ["e-fa-ra"],
  probe_sent:        ["e-fa-ra"],
  probe_federated:   ["e-ra-rb"],
  probe_delivered:   ["e-rb-res"],
  probe_response:    ["e-res-rb-ret", "e-rb-ra-ret", "e-ra-fa-ret"],
  task_sent:         ["e-fa-ra"],
  task_federated:    ["e-ra-rb"],
  task_delivered:    ["e-rb-res"],
  task_processing:   [],
  task_response:     ["e-res-rb-ret", "e-rb-ra-ret", "e-ra-fa-ret"],
  completed:         [],
  error:             [],
};

// ─── Custom node ──────────────────────────────────────────────────────────────

interface AgentNodeData {
  label:      string;
  sublabel:   string;
  color:      "blue" | "violet" | "cyan" | "emerald";
  isActive?:  boolean;
  [key: string]: unknown;
}

function AgentNode({ data }: NodeProps) {
  const d = data as AgentNodeData;
  const colorMap = {
    blue:    "from-blue-600/30 to-blue-800/20 border-blue-500/50",
    violet:  "from-violet-600/30 to-violet-800/20 border-violet-500/50",
    cyan:    "from-cyan-600/30 to-cyan-800/20 border-cyan-500/50",
    emerald: "from-emerald-600/30 to-emerald-800/20 border-emerald-500/50",
  } as const;
  const glowMap = {
    blue:    "shadow-blue-500/40",
    violet:  "shadow-violet-500/40",
    cyan:    "shadow-cyan-500/40",
    emerald: "shadow-emerald-500/40",
  } as const;
  return (
    <div
      className={cn(
        "bg-gradient-to-br border rounded-xl px-4 py-3 min-w-[130px] text-center transition-all duration-300",
        colorMap[d.color],
        d.isActive && `shadow-lg ${glowMap[d.color]} ring-2 ring-white/20`,
      )}
    >
      <p className="text-xs font-bold text-white">{d.label}</p>
      <p className="text-[10px] text-zinc-400 mt-0.5">{d.sublabel}</p>
    </div>
  );
}

// ─── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
      <div className={cn("h-0.5 w-5 rounded", color)} />
      {label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const nodeTypes = { agentNode: AgentNode };

interface Props {
  step: FlowStep;
}

export function FlowDiagram({ step }: Props) {
  const activeEdges = STEP_EDGES[step] ?? [];

  const nodes = useMemo<Node[]>(() => {
    const activeNode = (id: string) =>
      step !== "idle" && step !== "registering" && step !== "completed" &&
      (
        (id === "finance"  && ["probing", "probe_sent", "task_sent", "probe_response", "task_response", "completed"].includes(step)) ||
        (id === "relay_a"  && ["probe_sent", "probe_federated", "task_sent", "task_federated", "probe_response", "task_response"].includes(step)) ||
        (id === "relay_b"  && ["probe_federated", "probe_delivered", "task_federated", "task_delivered", "probe_response", "task_response"].includes(step)) ||
        (id === "research" && ["probe_delivered", "probe_response", "task_delivered", "task_processing", "task_response"].includes(step))
      );

    return [
      {
        id:       "finance",
        type:     "agentNode",
        position: { x: 0, y: 160 },
        data:     { label: "Finance Bot", sublabel: "Company A · TypeScript", color: "blue", isActive: activeNode("finance") },
      },
      {
        id:       "relay_a",
        type:     "agentNode",
        position: { x: 220, y: 80 },
        data:     { label: "Relay A", sublabel: ":8085 · NATS", color: "cyan", isActive: activeNode("relay_a") },
      },
      {
        id:       "relay_b",
        type:     "agentNode",
        position: { x: 440, y: 80 },
        data:     { label: "Relay B", sublabel: ":8086 · NATS", color: "emerald", isActive: activeNode("relay_b") },
      },
      {
        id:       "research",
        type:     "agentNode",
        position: { x: 660, y: 160 },
        data:     { label: "Research Bot", sublabel: "Company B · Python", color: "violet", isActive: activeNode("research") },
      },
    ];
  }, [step]);

  const makeEdge = useCallback(
    (
      id: string,
      source: string,
      target: string,
      label: string,
      color: string,
      animated: boolean,
      reverse = false,
    ): Edge => ({
      id,
      source: reverse ? target : source,
      target: reverse ? source : target,
      label,
      animated,
      type: "smoothstep",
      markerEnd:   { type: MarkerType.ArrowClosed, color: animated ? color : "#3f3f46" },
      style:       { stroke: animated ? color : "#3f3f46", strokeWidth: animated ? 2.5 : 1.5, opacity: animated ? 1 : 0.4 },
      labelStyle:  { fill: animated ? color : "#71717a", fontSize: 10, fontWeight: animated ? 700 : 400 },
      labelBgStyle:{ fill: "#18181b", fillOpacity: 0.9 },
    }),
    [],
  );

  const edges = useMemo<Edge[]>(() => {
    const a = (id: string) => activeEdges.includes(id);
    return [
      // Forward path (top lane)
      makeEdge("e-fa-ra",     "finance",  "relay_a",  "HTTP POST /send",    "#22d3ee", a("e-fa-ra")),
      makeEdge("e-ra-rb",     "relay_a",  "relay_b",  "POST /inbound",      "#22d3ee", a("e-ra-rb")),
      makeEdge("e-rb-res",    "relay_b",  "research", "NATS publish",       "#22d3ee", a("e-rb-res")),
      // Return path (bottom lane)
      makeEdge("e-res-rb-ret","research", "relay_b",  "HTTP POST /send",    "#a78bfa", a("e-res-rb-ret")),
      makeEdge("e-rb-ra-ret", "relay_b",  "relay_a",  "NATS replyToMailbox","#a78bfa", a("e-rb-ra-ret")),
      makeEdge("e-ra-fa-ret", "relay_a",  "finance",  "NATS deliver",       "#a78bfa", a("e-ra-fa-ret")),
    ];
  }, [activeEdges, makeEdge]);

  const stepLabel: Record<FlowStep, string> = {
    idle:             "Idle — start the demo to begin",
    registering:      "Registering Finance Bot with Relay A…",
    probing:          "Sending PROBE to Research Bot…",
    probe_sent:       "PROBE sent to Relay A",
    probe_federated:  "Relay A federating PROBE → Relay B",
    probe_delivered:  "Relay B delivering PROBE via NATS",
    probe_response:   "PROBE_RESPONSE routing back ← Research Bot",
    task_sent:        "TASK sent to Relay A (signed + UCAN)",
    task_federated:   "Relay A federating TASK → Relay B",
    task_delivered:   "Relay B delivering TASK via NATS",
    task_processing:  "Research Bot processing PDF…",
    task_response:    "RESPONSE routing back ← Research Bot",
    completed:        "Task completed ✓",
    error:            "Error — check event log",
  };

  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />

        <Panel position="top-center">
          <div
            className={cn(
              "mt-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300",
              step === "completed"  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
              step === "error"      ? "bg-red-500/10 border-red-500/30 text-red-300" :
              step === "idle"       ? "bg-zinc-800 border-zinc-700 text-zinc-400" :
                                      "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 animate-pulse",
            )}
          >
            {stepLabel[step]}
          </div>
        </Panel>

        <Panel position="bottom-left">
          <div className="mb-2 ml-2 flex flex-col gap-1.5 bg-black/60 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-0.5">Legend</p>
            <LegendItem color="bg-cyan-400"   label="Request (→)" />
            <LegendItem color="bg-violet-400" label="Response (←)" />
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
