import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Point Turbopack to the monorepo root so it resolves workspace packages correctly
    root: "../../",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};

// Inject Cloudflare bindings (KV, Durable Objects, Sandbox) during `next dev`
if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
