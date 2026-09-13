import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `npm run typecheck` remains the authoritative strict check. Next 16.3.5's
  // build-time TypeScript wrapper cannot parse this environment's showConfig
  // output, so production compilation must not duplicate that check.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
