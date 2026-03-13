import { loadConfig } from "./config.js";
import { connectNats } from "./nats.js";
import { buildServer } from "./server.js";

async function main() {
  const config = loadConfig();

  console.log(`[aamp-relay] Starting AAMP Relay v0.1.0`);
  console.log(`[aamp-relay] Domain:     ${config.domain}`);
  console.log(`[aamp-relay] Public URL: ${config.publicUrl}`);
  console.log(`[aamp-relay] NATS:       ${config.natsUrl}`);

  const nats = await connectNats(config);

  const server = await buildServer(config, nats);

  await server.listen({ port: config.httpPort, host: "0.0.0.0" });
  console.log(`[aamp-relay] HTTP server listening on port ${config.httpPort}`);

  const shutdown = async () => {
    console.log("[aamp-relay] Shutting down...");
    await server.close();
    await nats.nc.drain();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch(err => {
  console.error("[aamp-relay] Fatal error:", err);
  process.exit(1);
});
