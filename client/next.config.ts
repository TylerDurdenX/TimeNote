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
  async headers() {
    return [
      {
        source: "/(.*)",  // Apply this rule to all paths
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
