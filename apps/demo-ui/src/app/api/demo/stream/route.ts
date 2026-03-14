/**
 * GET /api/demo/stream?sessionId=<id>
 *
 * SSE endpoint that streams stdout lines from the two agent sandboxes.
 * Lines are parsed into FlowStep events that drive the FlowDiagram in the UI.
 *
 * Log line → FlowStep mapping:
 *   [finance-agent] Probing Research Agent...  → probe_sent
 *   [finance-agent] Probe accepted!            → probe_response
 *   [finance-agent] Sending summarize-pdf...   → task_sent
 *   [research-agent] Received summarize-pdf    → task_delivered / task_processing
 *   [finance-agent] ✓ Task completed           → completed
 *   [error] ...                                → error
 */

import { type NextRequest } from "next/server";
import { sessionLogs, sessionDone } from "../start/route";

export const runtime = "edge";

/** Maps a raw log line to a FlowStep name (or null if not a step-changing line). */
function parseFlowStep(line: string): string | null {
  if (line.includes("Probing Research Agent"))         return "probing";
  if (line.includes("Probe accepted"))                 return "probe_response";
  if (line.includes("Probe rejected"))                 return "error";
  if (line.includes("Sending summarize-pdf"))          return "task_sent";
  if (line.includes("Received summarize-pdf"))         return "task_processing";
  if (line.includes("Summary generated"))              return "task_response";
  if (line.includes("Task completed") ||
      line.includes("✓ Task completed"))               return "completed";
  if (line.includes("[error]"))                        return "error";
  return null;
}

export async function GET(req: NextRequest): Promise<Response> {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("sessionId required", { status: 400 });
  }

  const { readable, writable } = new TransformStream<string, string>();
  const writer  = writable.getWriter();
  const encoder = new TextEncoder();

  function send(eventName: string, data: string): void {
    writer.write(encoder.encode(`event: ${eventName}\ndata: ${data}\n\n`) as unknown as string);
  }

  (async () => {
    let cursor = 0;

    send("connected", "{}");

    while (true) {
      const logs = sessionLogs.get(sessionId);
      const done = sessionDone.get(sessionId);

      if (!logs) {
        send("error", JSON.stringify({ message: "Session not found" }));
        break;
      }

      // Drain any new log lines since last read
      while (cursor < logs.length) {
        const line = logs[cursor++];

        // Raw log line event (for debug panel / terminal view in UI)
        send("log", JSON.stringify({ line }));

        // Parse into a FlowStep event if it maps to one
        const step = parseFlowStep(line);
        if (step) {
          send("step", JSON.stringify({ step, line, timestamp: Date.now() }));
        }
      }

      if (done) {
        send("done", "{}");
        break;
      }

      // Poll every 200 ms
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    writer.close();
  })().catch(() => writer.close());

  return new Response(readable as unknown as BodyInit, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
