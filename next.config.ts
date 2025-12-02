import type { NextConfig } from "next";

// Minimal config to avoid Turbopack vs webpack conflict; aliasing is handled via tsconfig paths.
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  turbopack: {},
};

export default nextConfig;
