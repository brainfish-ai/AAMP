/** @type {import('next').NextConfig} */
const nextConfig = {
  // @vercel/sandbox uses Node.js built-ins (stream, os, etc.) — keep it server-side only
  serverExternalPackages: ["@vercel/sandbox"],
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

export default nextConfig;
