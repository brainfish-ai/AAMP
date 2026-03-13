"use client";

import { useState } from "react";
import type { LogEntry, MessageType } from "@/lib/types";
import { cn, formatTimestamp } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

const TYPE_STYLES: Record<MessageType | "SYSTEM" | "ERROR", string> = {
  PROBE:          "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PROBE_RESPONSE: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  TASK:           "bg-blue-500/15 text-blue-300 border-blue-500/30",
  RESPONSE:       "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  STATUS:         "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  CONFIRM:        "bg-green-500/15 text-green-300 border-green-500/30",
  CANCEL:         "bg-red-500/15 text-red-300 border-red-500/30",
  SYSTEM:         "bg-zinc-700/40 text-zinc-400 border-zinc-600/30",
  ERROR:          "bg-red-500/15 text-red-300 border-red-500/30",
};

function LogRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);
  const hasPayload = entry.payload !== undefined && entry.payload !== null;

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors",
          !hasPayload && "cursor-default",
        )}
        onClick={() => hasPayload && setOpen(o => !o)}
      >
        {/* Expand arrow */}
        <span className="shrink-0 text-zinc-600 w-3">
          {hasPayload
            ? open
              ? <ChevronDown size={12} />
              : <ChevronRight size={12} />
            : null}
        </span>

        {/* Timestamp */}
        <span className="shrink-0 font-mono text-[10px] text-zinc-600 w-24">
          {formatTimestamp(entry.timestamp)}
        </span>

        {/* Type badge */}
        <span
          className={cn(
            "shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide w-28 text-center",
            TYPE_STYLES[entry.type],
          )}
        >
          {entry.type}
        </span>

        {/* From → To */}
        <span className="shrink-0 text-xs text-zinc-400 w-48 truncate">
          <span className="text-zinc-300">{entry.from}</span>
          <span className="text-zinc-600 mx-1">→</span>
          <span className="text-zinc-300">{entry.to}</span>
        </span>

        {/* Label */}
        <span className="text-xs text-zinc-300 truncate flex-1">{entry.label}</span>

        {/* Task ID */}
        {entry.taskId && (
          <span className="shrink-0 font-mono text-[10px] text-zinc-600 hidden xl:block">
            {entry.taskId.slice(0, 8)}…
          </span>
        )}
      </button>

      {/* Expanded payload */}
      {open && hasPayload && (
        <div className="px-4 pb-3 pl-16">
          <pre className="text-[11px] font-mono text-zinc-300 bg-black/40 rounded-lg p-3 border border-white/5 overflow-x-auto leading-relaxed max-h-60 overflow-y-auto">
            {JSON.stringify(entry.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

interface Props {
  entries: LogEntry[];
}

export function EventLog({ entries }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">
            Event Log
          </span>
        </div>
        <span className="text-[10px] text-zinc-500">{entries.length} events</span>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-white/5 bg-white/[0.01]">
        <span className="w-3" />
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 w-24">Time</span>
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 w-28">Type</span>
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 w-48">From → To</span>
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 flex-1">Description</span>
      </div>

      {/* Rows */}
      <div className="overflow-y-auto max-h-72 flex-1">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">
            No events yet — run the demo to see messages flow
          </div>
        ) : (
          entries.map(e => <LogRow key={e.id} entry={e} />)
        )}
      </div>
    </div>
  );
}
