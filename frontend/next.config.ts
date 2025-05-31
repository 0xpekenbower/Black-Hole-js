import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GATEWAY_API: process.env.GATEWAY_API || 'http://localhost/api',
  },
  // Enable strict mode for React
  reactStrictMode: true,
  // Add async rewrites to handle API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.GATEWAY_API || 'http://localhost/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
