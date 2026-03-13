"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  Position,
  Panel,
  type Node,
  type Edge,
  type EdgeProps,
  type NodeProps,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Step → active elements ───────────────────────────────────────────────────

const STEP_EDGES: Record<FlowStep, string[]> = {
  idle:            [],
  registering:     ["e-fa-ra"],
  probing:         ["e-fa-ra"],
  probe_sent:      ["e-fa-ra"],
  probe_federated: ["e-ra-rb"],
  probe_delivered: ["e-rb-res"],
  probe_response:  ["e-res-rb", "e-rb-ra", "e-ra-fa"],
  task_sent:       ["e-fa-ra"],
  task_federated:  ["e-ra-rb"],
  task_delivered:  ["e-rb-res"],
  task_processing: [],
  task_response:   ["e-res-rb", "e-rb-ra", "e-ra-fa"],
  completed:       [],
  error:           [],
};

const STEP_NODES: Record<FlowStep, string[]> = {
  idle:            [],
  registering:     ["finance", "relay_a"],
  probing:         ["finance"],
  probe_sent:      ["finance", "relay_a"],
  probe_federated: ["relay_a", "relay_b"],
  probe_delivered: ["relay_b", "research"],
  probe_response:  ["research", "relay_b", "relay_a", "finance"],
  task_sent:       ["finance", "relay_a"],
  task_federated:  ["relay_a", "relay_b"],
  task_delivered:  ["relay_b", "research"],
  task_processing: ["research"],
  task_response:   ["research", "relay_b", "relay_a", "finance"],
  completed:       ["finance"],
  error:           [],
};

// ─── Animated edge ────────────────────────────────────────────────────────────

type AEdgeData = { active: boolean; color: string; label: string; curv?: number } & Record<string, unknown>;

function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const d = data as AEdgeData;
  const [path, lx, ly] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    curvature: d.curv ?? 0.3,
  });
  const col = d.active ? d.color : "#3f3f46";
  const opa = d.active ? 1 : 0.35;

  return (
    <>
      {d.active && (
        <path d={path} fill="none" stroke={col} strokeWidth={16} opacity={0.08} strokeLinecap="round" />
      )}
      <BaseEdge id={id} path={path} markerEnd={`url(#mk-${id})`}
        style={{ stroke: col, strokeWidth: d.active ? 2 : 1.5, opacity: opa, transition: "all 0.4s" }}
      />
      {d.active && (
        <path d={path} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round"
          strokeDasharray="8 96"
          style={{ animation: "aamp-flow 1.1s linear infinite", filter: `drop-shadow(0 0 6px ${col})` }}
        />
      )}
      <defs>
        <marker id={`mk-${id}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={col} opacity={opa} />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <div
          style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: "none" }}
          className="nodrag nopan"
        >
          <span
            className="px-2 py-0.5 rounded-md text-[9px] font-semibold leading-none"
            style={{
              color:      d.active ? col : "#52525b",
              background: "rgba(9,9,11,0.9)",
              border:     `1px solid ${d.active ? col + "55" : "rgba(63,63,70,0.3)"}`,
              transition: "all 0.4s",
            }}
          >
            {d.label}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// ─── Agent node ───────────────────────────────────────────────────────────────

type AgentData = { label: string; role: string; tech: string; icon: string; did: string; scheme: "blue" | "violet"; active: boolean } & Record<string, unknown>;

function AgentNode({ data }: NodeProps) {
  const d = data as AgentData;
  const palette = {
    blue:   { grad: "from-blue-950/90 via-blue-900/70 to-zinc-900/80", border: "border-blue-500/40",   activeBorder: "border-blue-400",   glow: "shadow-blue-500/30",   chip: "bg-blue-500/15 text-blue-300 border-blue-500/30",   dot: "bg-blue-400", accent: "#60a5fa" },
    violet: { grad: "from-violet-950/90 via-violet-900/70 to-zinc-900/80", border: "border-violet-500/40", activeBorder: "border-violet-400", glow: "shadow-violet-500/30", chip: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400", accent: "#a78bfa" },
  }[d.scheme];

  return (
    <div className={cn(
      "bg-linear-to-br rounded-xl border w-[152px] h-[108px] overflow-hidden transition-all duration-300 relative flex flex-col",
      palette.grad,
      d.active ? `${palette.activeBorder} shadow-xl ${palette.glow}` : palette.border,
    )}>
      {/* Top accent line */}
      <div className="h-[2px] w-full shrink-0" style={{ background: d.active ? `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` : "transparent", transition: "all 0.4s" }} />

      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Left}  style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Left}  id="ls" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Right} id="rt" style={{ opacity: 0, pointerEvents: "none" }} />

      <div className="flex-1 flex flex-col justify-between px-3.5 pt-2.5 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-white leading-tight">{d.label}</p>
          {d.active
            ? <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shrink-0", palette.dot)} />
            : <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
          }
        </div>
        <p className="text-[9px] text-zinc-400 leading-snug">{d.role}</p>
        <span className={cn("self-start px-1.5 py-0.5 rounded-full text-[8px] font-bold border tracking-wide", palette.chip)}>
          {d.tech}
        </span>
      </div>
    </div>
  );
}

// ─── Relay node ───────────────────────────────────────────────────────────────

type RelayData = { label: string; port: string; domain: string; active: boolean; scheme: "cyan" | "emerald" } & Record<string, unknown>;

function RelayNode({ data }: NodeProps) {
  const d = data as RelayData;
  const palette = {
    cyan:    { grad: "from-cyan-950/90 via-teal-900/70 to-zinc-900/80",    border: "border-cyan-500/40",    activeBorder: "border-cyan-400",    glow: "shadow-cyan-500/30",    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",       accent: "#22d3ee" },
    emerald: { grad: "from-emerald-950/90 via-green-900/70 to-zinc-900/80", border: "border-emerald-500/40", activeBorder: "border-emerald-400", glow: "shadow-emerald-500/30", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", accent: "#34d399" },
  }[d.scheme];

  return (
    <div className={cn(
      "bg-linear-to-br rounded-xl border w-[145px] h-[108px] overflow-hidden transition-all duration-300 flex flex-col",
      palette.grad,
      d.active ? `${palette.activeBorder} shadow-xl ${palette.glow}` : palette.border,
    )}>
      <div className="h-[2px] w-full shrink-0" style={{ background: d.active ? `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` : "transparent", transition: "all 0.4s" }} />

      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Left}  style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Left}  id="ls" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Right} id="rt" style={{ opacity: 0, pointerEvents: "none" }} />

      <div className="flex-1 flex flex-col justify-between px-3.5 pt-2.5 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-white leading-tight">{d.label}</p>
          {d.active && (
            <div className="flex gap-[2px] items-end h-3.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-[3px] rounded-sm"
                  style={{ background: palette.accent, height: "100%", animation: `aamp-bar 0.6s ease-in-out ${i * 0.15}s infinite alternate`, opacity: 0.8 }}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-[9px] text-zinc-400 leading-snug font-mono">{d.domain}</p>
        <div className="flex items-center gap-1">
          <span className={cn("px-1.5 py-0.5 rounded-full text-[8px] font-bold border tracking-wide", palette.chip)}>:{d.port}</span>
          <span className={cn("px-1.5 py-0.5 rounded-full text-[8px] font-bold border tracking-wide", palette.chip)}>NATS</span>
        </div>
      </div>
    </div>
  );
}

// ─── Node / edge type registries ──────────────────────────────────────────────

const nodeTypes = { agentNode: AgentNode, relayNode: RelayNode };
const edgeTypes = { aEdge: AnimatedEdge };

// ─── Positions (RF canvas pixels, scaled by fitView) ─────────────────────────
//
//  [Finance Bot]──(cyan)──[Relay A]──(cyan)──[Relay B]──(cyan)──[Research Bot]
//       └───────────(violet return path)────────────────────────────┘
//
//  x:    30        230        490         690
//  y:   100         80         80         100
//
// ─────────────────────────────────────────────────────────────────────────────

const BASE_NODES: Node[] = [
  { id: "finance",  type: "agentNode", position: { x: 30,  y: 90 }, data: {} },
  { id: "relay_a",  type: "relayNode", position: { x: 230, y: 90 }, data: {} },
  { id: "relay_b",  type: "relayNode", position: { x: 490, y: 90 }, data: {} },
  { id: "research", type: "agentNode", position: { x: 690, y: 90 }, data: {} },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { step: FlowStep }

export function FlowDiagram({ step }: Props) {
  const activeEdges = STEP_EDGES[step] ?? [];
  const activeNodes = STEP_NODES[step] ?? [];

  const nodes = useMemo<Node[]>(() => BASE_NODES.map(n => {
    const active = activeNodes.includes(n.id);
    if (n.id === "finance")  return { ...n, data: { label: "Finance Bot",  role: "Company A · AAMP Client", tech: "TypeScript", icon: "🏦", scheme: "blue",    did: "did:key:…",         active } };
    if (n.id === "relay_a")  return { ...n, data: { label: "Relay A",      port: "8085", domain: "company-a.local", scheme: "cyan",    active } };
    if (n.id === "relay_b")  return { ...n, data: { label: "Relay B",      port: "8086", domain: "company-b.local", scheme: "emerald", active } };
    if (n.id === "research") return { ...n, data: { label: "Research Bot", role: "Company B · AAMP Agent",  tech: "Python",     icon: "🔬", scheme: "violet", did: "did:web:…",         active } };
    return n;
  }), [activeNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const edges = useMemo<Edge[]>(() => [
    { id: "e-fa-ra",  source: "finance",  target: "relay_a",  type: "aEdge", data: { active: activeEdges.includes("e-fa-ra"),  color: "#22d3ee", label: "POST /send",      curv: 0.2 } },
    { id: "e-ra-rb",  source: "relay_a",  target: "relay_b",  type: "aEdge", data: { active: activeEdges.includes("e-ra-rb"),  color: "#22d3ee", label: "POST /inbound",   curv: 0.1 } },
    { id: "e-rb-res", source: "relay_b",  target: "research", type: "aEdge", data: { active: activeEdges.includes("e-rb-res"), color: "#22d3ee", label: "NATS publish",    curv: 0.2 } },
    { id: "e-res-rb", source: "research", target: "relay_b",  type: "aEdge", data: { active: activeEdges.includes("e-res-rb"), color: "#a78bfa", label: "POST /send",      curv: 0.6 } },
    { id: "e-rb-ra",  source: "relay_b",  target: "relay_a",  type: "aEdge", sourceHandle: "ls", targetHandle: "rt", data: { active: activeEdges.includes("e-rb-ra"),  color: "#a78bfa", label: "HTTP /inbound",   curv: 0.5 } },
    { id: "e-ra-fa",  source: "relay_a",  target: "finance",  type: "aEdge", data: { active: activeEdges.includes("e-ra-fa"),  color: "#a78bfa", label: "NATS deliver",    curv: 0.6 } },
  ], [activeEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepMeta: Record<FlowStep, { label: string; variant: "idle" | "active" | "done" | "error" }> = {
    idle:            { label: "Idle — click Run Full Demo to start",            variant: "idle"   },
    registering:     { label: "Registering agent with Relay A…",               variant: "active" },
    probing:         { label: "Sending PROBE to check Research Bot capability", variant: "active" },
    probe_sent:      { label: "PROBE dispatched → Relay A",                    variant: "active" },
    probe_federated: { label: "PROBE federating Relay A → Relay B",            variant: "active" },
    probe_delivered: { label: "PROBE delivered to Research Bot",               variant: "active" },
    probe_response:  { label: "PROBE_RESPONSE ✓ — routing back to Finance Bot",variant: "active" },
    task_sent:       { label: "TASK dispatched → Relay A",                     variant: "active" },
    task_federated:  { label: "TASK federating Relay A → Relay B",             variant: "active" },
    task_delivered:  { label: "TASK delivered to Research Bot",                variant: "active" },
    task_processing: { label: "Research Bot processing document…",             variant: "active" },
    task_response:   { label: "RESPONSE flowing back to Finance Bot",          variant: "active" },
    completed:       { label: "Task completed ✓",                              variant: "done"   },
    error:           { label: "Error — check the event log below",             variant: "error"  },
  };

  const { label, variant } = stepMeta[step];

  return (
    <div className="relative w-full h-[290px] rounded-2xl overflow-hidden border border-white/[0.07] bg-zinc-950">
      {/* Swim-lane background (outside RF viewport so it never moves) */}
      <div className="absolute inset-0 flex pointer-events-none select-none" style={{ zIndex: 0 }}>
        {/* Company A */}
        <div className="flex-1 border-r border-blue-500/10 bg-linear-to-br from-blue-950/20 to-transparent flex flex-col justify-end pb-3 pl-4">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-blue-500/50">Company A</span>
        </div>
        {/* Federation */}
        <div className="w-[26%] border-x border-white/4 bg-zinc-900/10 flex flex-col justify-end pb-3 pl-3">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400">Federation</span>
        </div>
        {/* Company B */}
        <div className="flex-1 border-l border-violet-500/10 bg-linear-to-bl from-violet-950/20 to-transparent flex flex-col justify-end pb-3 pl-4">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-violet-500/50">Company B</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.28 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        connectionLineType={ConnectionLineType.Bezier}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" style={{ zIndex: 1 }} />

        {/* Status bar */}
        <Panel position="top-center" style={{ zIndex: 10 }}>
          <div className={cn(
            "mt-2 px-4 py-1.5 rounded-full text-[10px] font-semibold border backdrop-blur-md transition-all duration-500 flex items-center gap-2",
            variant === "done"   && "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
            variant === "error"  && "bg-red-950/80 border-red-500/40 text-red-300",
            variant === "idle"   && "bg-zinc-900/80 border-zinc-700/60 text-zinc-400",
            variant === "active" && "bg-zinc-950/90 border-cyan-500/30 text-cyan-300",
          )}>
            {variant === "active" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
            )}
            {variant === "done"  && <span className="text-emerald-400">●</span>}
            {label}
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" style={{ zIndex: 10 }}>
          <div className="mb-2 ml-2 bg-zinc-950/80 backdrop-blur-sm border border-white/[0.07] rounded-xl px-3.5 py-2.5 flex flex-col gap-1.5">
            <p className="text-[7px] uppercase tracking-[0.2em] text-zinc-400 mb-0.5 font-semibold">Protocol</p>
            <LegendRow color="#22d3ee" label="Request / Forward" dashed={false} />
            <LegendRow color="#a78bfa" label="Response / Return" dashed />
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

function LegendRow({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="30" height="8" viewBox="0 0 30 8" fill="none">
        <line x1="1" y1="4" x2="21" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? "3 3" : undefined} strokeLinecap="round" />
        <polygon points="20,1.5 29,4 20,6.5" fill={color} />
      </svg>
      <span className="text-[9px] text-zinc-400">{label}</span>
    </div>
  );
}
