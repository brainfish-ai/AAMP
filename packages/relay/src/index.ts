/**
 * AAMP Relay — Cloudflare Workers entry point.
 *
 * The NATS connection and Hono app are cached at module scope so they are
 * reused across requests handled by the same Worker instance.
 */

import { loadConfig, type WorkerEnv } from "./config.js";
import { connectNats, type NatsContext } from "./nats.js";
import { buildApp } from "./server.js";
import type { Hono } from "hono";

let cachedNats: NatsContext | null = null;
let cachedApp:  ReturnType<typeof buildApp> | null = null;
let cachedKv:   KVNamespace | null = null;

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const config = loadConfig(env);

    // Re-create NATS connection if closed or first request
    if (!cachedNats || cachedNats.nc.isClosed()) {
      console.log("[relay] Establishing NATS connection...");
      cachedNats = await connectNats(config);
      cachedApp  = null;  // force app rebuild with new NATS context
    }

    // Build the Hono app once per Worker instance (or after NATS reconnect)
    if (!cachedApp || cachedKv !== env.KV_AGENTS) {
      cachedKv  = env.KV_AGENTS;
      cachedApp = buildApp(config, cachedNats, env.KV_AGENTS);
    }

    return cachedApp.fetch(request, env, ctx);
  },
};
