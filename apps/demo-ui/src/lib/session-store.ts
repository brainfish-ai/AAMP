/**
 * In-process session state shared between /api/demo/start and /api/demo/stream.
 *
 * Both routes must run on the same Node.js runtime (not Edge) for this to work.
 * For production scale, replace with Vercel KV.
 */
export const sessionLogs = new Map<string, string[]>();
export const sessionDone = new Map<string, boolean>();
