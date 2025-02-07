import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint during production builds
  },
  typescript: {
    ignoreBuildErrors: true,  // Disables TypeScript checks during production builds
  },
};

export default nextConfig;
