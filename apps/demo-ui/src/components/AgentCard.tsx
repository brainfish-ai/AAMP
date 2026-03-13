"use client";

import { cn, shortDid } from "@/lib/utils";
import type { AgentState, RelayHealth } from "@/lib/types";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface Props {
  label:      string;
  company:    string;
  tech:       string;
  agent:      AgentState | null;
  relay:      RelayHealth;
  relayLabel: string;
  side:       "left" | "right";
  capabilities?: string[];
  isActive?:  boolean;
}

export function AgentCard({
  label,
  company,
  tech,
  agent,
  relay,
  relayLabel,
  side,
  capabilities = [],
  isActive = false,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-3 transition-all duration-500",
        isActive && "ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20",
        side === "left" ? "border-blue-500/30" : "border-violet-500/30",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {company}
          </p>
          <h2 className="text-lg font-bold text-white mt-0.5">{label}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{tech}</p>
        </div>
        <ConnectionBadge connected={agent?.connected ?? false} />
      </div>

      {/* DID */}
      <div className="rounded-lg bg-black/30 px-3 py-2 border border-white/5">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">DID</p>
        <p className="font-mono text-xs text-cyan-300 break-all leading-relaxed">
          {agent?.did ? shortDid(agent.did) : (
            <span className="text-zinc-600 italic">generating…</span>
          )}
        </p>
      </div>

      {/* Relay status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            relay.status === "ok"       ? "bg-emerald-400"  :
            relay.status === "checking" ? "bg-amber-400 animate-pulse" :
                                          "bg-red-500",
          )}
        />
        <span className="text-xs text-zinc-400">
          {relayLabel}
          {relay.domain && (
            <span className="ml-1 text-zinc-500">({relay.domain})</span>
          )}
        </span>
      </div>

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {capabilities.map(cap => (
            <span
              key={cap}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                side === "right"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-300",
              )}
            >
              {cap}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectionBadge({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
        <Wifi size={10} />
        Connected
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
      <WifiOff size={10} />
      Offline
    </span>
  );
}
