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

export default nextConfig;
