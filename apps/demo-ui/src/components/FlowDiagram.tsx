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
//
//  Layout (RF canvas pixels):
//
//  Row 1 (y=40):  [Finance Bot]──[Relay A CF]────────[Relay B CF]──[Research Bot]
//                  x=20           x=220               x=480          x=680
//
//  Row 2 (y=220): (arrow down from Relay A)
//                              [Relay C Vercel]──[Compliance Bot]
//                               x=220              x=440
//
// Edges:
//   e-fa-ra   Finance  → Relay A     (row1 forward)
//   e-ra-rb   Relay A  → Relay B     (row1 forward, federation)
//   e-rb-res  Relay B  → Research    (row1 forward)
//   e-res-rb  Research → Relay B     (row1 return)
//   e-rb-ra   Relay B  → Relay A     (row1 return, federation)
//   e-ra-fa   Relay A  → Finance     (row1 return)
//   e-ra-rc   Relay A  → Relay C     (vertical, row1→row2, cross-provider)
//   e-rc-comp Relay C  → Compliance  (row2 forward)
//   e-comp-rc Compliance → Relay C   (row2 return)
//   e-rc-ra   Relay C  → Relay A     (vertical return, row2→row1)

const P1_FWD = "#22d3ee";   // cyan  — request / forward
const P1_RET = "#a78bfa";   // violet — response / return
const P2_FWD = "#f59e0b";   // amber — cross-provider forward
const P2_RET = "#34d399";   // emerald — cross-provider return

const STEP_EDGES: Record<FlowStep, string[]> = {
  idle:                    [],
  registering:             ["e-fa-ra"],
  // Phase 1 forward
  probing:                 ["e-fa-ra"],
  probe_sent:              ["e-fa-ra"],
  probe_federated:         ["e-ra-rb"],
  probe_delivered:         ["e-rb-res"],
  // Phase 1 return
  probe_response:          ["e-res-rb", "e-rb-ra", "e-ra-fa"],
  task_sent:               ["e-fa-ra"],
  task_federated:          ["e-ra-rb"],
  task_delivered:          ["e-rb-res"],
  task_processing:         [],
  task_response:           ["e-res-rb", "e-rb-ra", "e-ra-fa"],
  research_done:           [],
  // Phase 2 forward (cross-provider: CF → Vercel Sandbox)
  compliance_probing:      ["e-fa-ra"],
  compliance_probe_response: ["e-ra-rc", "e-rc-comp"],
  compliance_task_sent:    ["e-fa-ra", "e-ra-rc"],
  compliance_processing:   ["e-ra-rc", "e-rc-comp"],
  compliance_done:         ["e-comp-rc", "e-rc-ra", "e-ra-fa"],
  // Terminal
  completed:               [],
  error:                   [],
};

const STEP_NODES: Record<FlowStep, string[]> = {
  idle:                    [],
  registering:             ["finance", "relay_a"],
  probing:                 ["finance"],
  probe_sent:              ["finance", "relay_a"],
  probe_federated:         ["relay_a", "relay_b"],
  probe_delivered:         ["relay_b", "research"],
  probe_response:          ["research", "relay_b", "relay_a", "finance"],
  task_sent:               ["finance", "relay_a"],
  task_federated:          ["relay_a", "relay_b"],
  task_delivered:          ["relay_b", "research"],
  task_processing:         ["research"],
  task_response:           ["research", "relay_b", "relay_a", "finance"],
  research_done:           ["finance"],
  compliance_probing:      ["finance", "relay_a"],
  compliance_probe_response: ["relay_a", "relay_c", "compliance"],
  compliance_task_sent:    ["finance", "relay_a", "relay_c"],
  compliance_processing:   ["relay_c", "compliance"],
  compliance_done:         ["compliance", "relay_c", "relay_a", "finance"],
  completed:               ["finance"],
  error:                   [],
};

// ─── Animated edge ────────────────────────────────────────────────────────────

type AEdgeData = { active: boolean; color: string; label: string; curv?: number } & Record<string, unknown>;

function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const d = data as AEdgeData;
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: d.curv ?? 0.25 });
  const col = d.active ? d.color : "#3f3f46";
  const opa = d.active ? 1 : 0.3;

  return (
    <>
      {d.active && <path d={path} fill="none" stroke={col} strokeWidth={16} opacity={0.07} strokeLinecap="round" />}
      <BaseEdge id={id} path={path} markerEnd={`url(#mk-${id})`}
        style={{ stroke: col, strokeWidth: d.active ? 2 : 1.5, opacity: opa, transition: "all 0.4s" }} />
      {d.active && (
        <path d={path} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round"
          strokeDasharray="8 96"
          style={{ animation: "aamp-flow 1.1s linear infinite", filter: `drop-shadow(0 0 6px ${col})` }} />
      )}
      <defs>
        <marker id={`mk-${id}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={col} opacity={opa} />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <div style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: "none" }} className="nodrag nopan">
          <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold leading-none"
            style={{ color: d.active ? col : "#52525b", background: "rgba(9,9,11,0.9)", border: `1px solid ${d.active ? col + "55" : "rgba(63,63,70,0.3)"}`, transition: "all 0.4s" }}>
            {d.label}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// ─── Agent node ───────────────────────────────────────────────────────────────

type AgentData = { label: string; role: string; tech: string; provider: string; scheme: "blue" | "violet" | "amber"; active: boolean } & Record<string, unknown>;

function AgentNode({ data }: NodeProps) {
  const d = data as AgentData;
  const palette = {
    blue:   { grad: "from-blue-950/90 via-blue-900/70 to-zinc-900/80",     border: "border-blue-500/40",   activeBorder: "border-blue-400",   glow: "shadow-blue-500/30",   chip: "bg-blue-500/15 text-blue-300 border-blue-500/30",   dot: "bg-blue-400",   accent: "#60a5fa" },
    violet: { grad: "from-violet-950/90 via-violet-900/70 to-zinc-900/80", border: "border-violet-500/40", activeBorder: "border-violet-400", glow: "shadow-violet-500/30", chip: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400", accent: "#a78bfa" },
    amber:  { grad: "from-amber-950/90 via-orange-900/70 to-zinc-900/80",  border: "border-amber-500/40",  activeBorder: "border-amber-400",  glow: "shadow-amber-500/30",  chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",  dot: "bg-amber-400",  accent: "#fbbf24" },
  }[d.scheme];

  return (
    <div className={cn("bg-linear-to-br rounded-xl border w-[140px] h-[100px] overflow-hidden transition-all duration-300 relative flex flex-col", palette.grad, d.active ? `${palette.activeBorder} shadow-xl ${palette.glow}` : palette.border)}>
      <div className="h-[2px] w-full shrink-0" style={{ background: d.active ? `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` : "transparent", transition: "all 0.4s" }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Left}  style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Left}  id="ls" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Right} id="rt" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Bottom} id="bs" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Top}    id="tt" style={{ opacity: 0, pointerEvents: "none" }} />
      <div className="flex-1 flex flex-col justify-between px-3 pt-2 pb-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-white leading-tight">{d.label}</p>
          {d.active ? <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shrink-0", palette.dot)} /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />}
        </div>
        <p className="text-[8px] text-zinc-400 leading-snug">{d.role}</p>
        <div className="flex gap-1">
          <span className={cn("px-1.5 py-0.5 rounded-full text-[7px] font-bold border tracking-wide", palette.chip)}>{d.tech}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold border bg-white/5 text-zinc-400 border-white/10">{d.provider}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Relay node ───────────────────────────────────────────────────────────────

type RelayData = { label: string; provider: string; domain: string; badge: string; active: boolean; scheme: "cyan" | "emerald" | "amber" } & Record<string, unknown>;

function RelayNode({ data }: NodeProps) {
  const d = data as RelayData;
  const palette = {
    cyan:    { grad: "from-cyan-950/90 via-teal-900/70 to-zinc-900/80",      border: "border-cyan-500/40",    activeBorder: "border-cyan-400",    glow: "shadow-cyan-500/30",    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",       accent: "#22d3ee" },
    emerald: { grad: "from-emerald-950/90 via-green-900/70 to-zinc-900/80",  border: "border-emerald-500/40", activeBorder: "border-emerald-400", glow: "shadow-emerald-500/30", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", accent: "#34d399" },
    amber:   { grad: "from-amber-950/90 via-yellow-900/70 to-zinc-900/80",   border: "border-amber-500/40",   activeBorder: "border-amber-400",   glow: "shadow-amber-500/30",   chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",       accent: "#fbbf24" },
  }[d.scheme];

  return (
    <div className={cn("bg-linear-to-br rounded-xl border w-[138px] h-[100px] overflow-hidden transition-all duration-300 flex flex-col", palette.grad, d.active ? `${palette.activeBorder} shadow-xl ${palette.glow}` : palette.border)}>
      <div className="h-[2px] w-full shrink-0" style={{ background: d.active ? `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` : "transparent", transition: "all 0.4s" }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Left}   id="ls" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Right}  id="rt" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="source" position={Position.Bottom} id="bs" style={{ opacity: 0, pointerEvents: "none" }} />
      <Handle type="target" position={Position.Top}    id="tt" style={{ opacity: 0, pointerEvents: "none" }} />
      <div className="flex-1 flex flex-col justify-between px-3 pt-2 pb-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-white leading-tight">{d.label}</p>
          {d.active && (
            <div className="flex gap-[2px] items-end h-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-[3px] rounded-sm"
                  style={{ background: palette.accent, height: "100%", animation: `aamp-bar 0.6s ease-in-out ${i * 0.15}s infinite alternate`, opacity: 0.8 }} />
              ))}
            </div>
          )}
        </div>
        <p className="text-[8px] text-zinc-400 font-mono leading-snug truncate">{d.domain}</p>
        <div className="flex gap-1 flex-wrap">
          <span className={cn("px-1.5 py-0.5 rounded-full text-[7px] font-bold border tracking-wide", palette.chip)}>{d.badge}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold border bg-white/5 text-zinc-400 border-white/10">{d.provider}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Node / edge registries ───────────────────────────────────────────────────

const nodeTypes = { agentNode: AgentNode, relayNode: RelayNode };
const edgeTypes = { aEdge: AnimatedEdge };

// ─── Static nodes ─────────────────────────────────────────────────────────────

const BASE_NODES: Node[] = [
  // Row 1 — Cloudflare + Research
  { id: "finance",    type: "agentNode", position: { x: 20,  y: 30  }, data: {} },
  { id: "relay_a",    type: "relayNode", position: { x: 205, y: 30  }, data: {} },
  { id: "relay_b",    type: "relayNode", position: { x: 460, y: 30  }, data: {} },
  { id: "research",   type: "agentNode", position: { x: 645, y: 30  }, data: {} },
  // Row 2 — Vercel Sandbox (Company C)
  { id: "relay_c",    type: "relayNode", position: { x: 205, y: 210 }, data: {} },
  { id: "compliance", type: "agentNode", position: { x: 390, y: 210 }, data: {} },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { step: FlowStep }

export function FlowDiagram({ step }: Props) {
  const activeEdges = STEP_EDGES[step] ?? [];
  const activeNodes = STEP_NODES[step] ?? [];

  const nodes = useMemo<Node[]>(() => BASE_NODES.map(n => {
    const active = activeNodes.includes(n.id);
    switch (n.id) {
      case "finance":    return { ...n, data: { label: "Finance Bot",    role: "Company A · AAMP Client",  tech: "TypeScript", provider: "Intra",  scheme: "blue",   active } };
      case "relay_a":    return { ...n, data: { label: "Relay A",        domain: "company-a.aamp",          badge: "Intra",     provider: "CF",      scheme: "cyan",   active } };
      case "relay_b":    return { ...n, data: { label: "Relay B",        domain: "company-b.aamp",          badge: "Intra",     provider: "CF",      scheme: "emerald",active } };
      case "research":   return { ...n, data: { label: "Research Bot",   role: "Company B · PDF Analyst",   tech: "Python",     provider: "Intra",   scheme: "violet", active } };
      case "relay_c":    return { ...n, data: { label: "Relay C",        domain: "company-c.sandbox",       badge: "Inter",     provider: "Vercel",  scheme: "amber",  active } };
      case "compliance": return { ...n, data: { label: "Compliance Bot", role: "Company C · Reg Checker",   tech: "TypeScript", provider: "Inter",   scheme: "amber",  active } };
      default: return n;
    }
  }), [activeNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const edges = useMemo<Edge[]>(() => [
    // Row 1 — Phase 1 (Finance ↔ Research via Cloudflare)
    { id: "e-fa-ra",  source: "finance",    target: "relay_a",    type: "aEdge", data: { active: activeEdges.includes("e-fa-ra"),   color: P1_FWD, label: "POST /send",    curv: 0.2 } },
    { id: "e-ra-rb",  source: "relay_a",    target: "relay_b",    type: "aEdge", data: { active: activeEdges.includes("e-ra-rb"),   color: P1_FWD, label: "Intra (NATS)", curv: 0.1 } },
    { id: "e-rb-res", source: "relay_b",    target: "research",   type: "aEdge", data: { active: activeEdges.includes("e-rb-res"),  color: P1_FWD, label: "SSE deliver",   curv: 0.2 } },
    { id: "e-res-rb", source: "research",   target: "relay_b",    type: "aEdge", data: { active: activeEdges.includes("e-res-rb"),  color: P1_RET, label: "POST /send",    curv: 0.55 } },
    { id: "e-rb-ra",  source: "relay_b",    target: "relay_a",    type: "aEdge", sourceHandle: "ls", targetHandle: "rt", data: { active: activeEdges.includes("e-rb-ra"),  color: P1_RET, label: "HTTP /inbound", curv: 0.5 } },
    { id: "e-ra-fa",  source: "relay_a",    target: "finance",    type: "aEdge", data: { active: activeEdges.includes("e-ra-fa"),   color: P1_RET, label: "SSE deliver",   curv: 0.55 } },
    // Vertical — Phase 2 cross-provider (Cloudflare A → Vercel Sandbox C)
    { id: "e-ra-rc",  source: "relay_a",    target: "relay_c",    type: "aEdge", sourceHandle: "bs", targetHandle: "tt",
      data: { active: activeEdges.includes("e-ra-rc"),   color: P2_FWD, label: "Inter (HTTP)", curv: 0.0 } },
    // Row 2 — Phase 2 (Finance → Compliance via Relay C Vercel Sandbox)
    { id: "e-rc-comp",source: "relay_c",    target: "compliance", type: "aEdge", data: { active: activeEdges.includes("e-rc-comp"),  color: P2_FWD, label: "SSE deliver",   curv: 0.2 } },
    { id: "e-comp-rc",source: "compliance", target: "relay_c",    type: "aEdge", data: { active: activeEdges.includes("e-comp-rc"),  color: P2_RET, label: "POST /send",    curv: 0.55 } },
    { id: "e-rc-ra",  source: "relay_c",    target: "relay_a",    type: "aEdge", sourceHandle: "tt", targetHandle: "bs",
      data: { active: activeEdges.includes("e-rc-ra"),   color: P2_RET, label: "Inter (NATS)",  curv: 0.0 } },
  ], [activeEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepMeta: Record<FlowStep, { label: string; variant: "idle" | "active" | "done" | "error" }> = {
    idle:                      { label: "Idle — click Run Full Demo",                              variant: "idle"   },
    registering:               { label: "Registering Finance Agent with Relay A…",                 variant: "active" },
    probing:                   { label: "PROBE → Research Bot [Intra: Relay A → B]",               variant: "active" },
    probe_sent:                { label: "PROBE dispatched → Relay A [Intra]",                      variant: "active" },
    probe_federated:           { label: "PROBE federating Relay A → Relay B via NATS [Intra]",     variant: "active" },
    probe_delivered:           { label: "PROBE delivered to Research Bot [Intra]",                 variant: "active" },
    probe_response:            { label: "PROBE_RESPONSE ✓ — returning via Intra federation",       variant: "active" },
    task_sent:                 { label: "TASK dispatched → Relay A [Intra]",                       variant: "active" },
    task_federated:            { label: "TASK federating A → B via NATS JetStream [Intra]",        variant: "active" },
    task_delivered:            { label: "TASK delivered to Research Bot [Intra]",                  variant: "active" },
    task_processing:           { label: "Research Bot processing document… [Intra]",                variant: "active" },
    task_response:             { label: "RESPONSE flowing back via Intra federation",              variant: "active" },
    research_done:             { label: "✓ Intra complete — starting Inter (cross-provider)",      variant: "active" },
    compliance_probing:        { label: "PROBE → Compliance Bot [Inter: Relay A → Relay C]",       variant: "active" },
    compliance_probe_response: { label: "PROBE_RESPONSE ✓ — Relay C accepted [Inter]",            variant: "active" },
    compliance_task_sent:      { label: "Compliance-check TASK → Relay A → Relay C [Inter]",       variant: "active" },
    compliance_processing:     { label: "Compliance Bot running checks… [Inter: Vercel Sandbox]",  variant: "active" },
    compliance_done:           { label: "✓ Inter complete — Intra + Inter flow done!",             variant: "done"   },
    completed:                 { label: "✓ Intra + Inter cross-provider demo complete",            variant: "done"   },
    error:                     { label: "Error — check event log",                                  variant: "error"  },
  };

  const { label, variant } = stepMeta[step];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.07] bg-zinc-950" style={{ height: 380 }}>
      {/* Swim-lane background */}
      <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
        {/* Row 1 — Intra-provider (Cloudflare Workers) */}
        <div className="absolute left-0 right-0 border-b border-white/[0.04]" style={{ top: 0, height: "53%" }}>
          <div className="absolute inset-0 flex">
            <div className="w-[25%] border-r border-blue-500/10 bg-blue-950/10 flex items-end pb-2 pl-3">
              <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-blue-500/40">Company A</span>
            </div>
            <div className="flex-1 bg-cyan-950/5 flex items-end pb-2 pl-3">
              <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-cyan-500/40">Intra-Provider Federation</span>
            </div>
            <div className="w-[25%] border-l border-violet-500/10 bg-violet-950/10 flex items-end pb-2 pl-3">
              <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-violet-500/40">Company B</span>
            </div>
          </div>
        </div>
        {/* Row 2 — Inter-provider (Vercel Sandbox) */}
        <div className="absolute left-0 right-[40%] bottom-0" style={{ top: "53%" }}>
          <div className="absolute inset-0 bg-amber-950/10 border-r border-amber-500/10 flex items-center pb-2 pl-3">
            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-amber-500/40">Company C — Inter-Provider</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
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
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#27272a" style={{ zIndex: 1 }} />

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
            {variant === "done" && <span className="text-emerald-400">●</span>}
            {label}
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-right" style={{ zIndex: 10 }}>
          <div className="mb-2 mr-2 bg-zinc-950/80 backdrop-blur-sm border border-white/[0.07] rounded-xl px-3 py-2 flex flex-col gap-1.5">
            <p className="text-[7px] uppercase tracking-[0.2em] text-zinc-400 mb-0.5 font-semibold">Protocol</p>
            <LegendRow color={P1_FWD} label="Intra request (NATS)" />
            <LegendRow color={P1_RET} label="Intra response" />
            <LegendRow color={P2_FWD} label="Inter forward (cross-provider)" />
            <LegendRow color={P2_RET} label="Inter return (cross-provider)" />
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
        <line x1="1" y1="4" x2="20" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="18,1.5 27,4 18,6.5" fill={color} />
      </svg>
      <span className="text-[9px] text-zinc-400">{label}</span>
    </div>
  );
}
