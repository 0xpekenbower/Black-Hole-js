import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // crossOrigin: 'use-credentials',
  // Enable strict mode for React
  reactStrictMode: false,
  // // Add async rewrites to handle API requests
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:6969/api/:path*',
  //     },
  //   ];
  // },
  // Configure allowed image domains
  // experimental: {
  //   allowedDevOrigins: ['blackholejs.art']
  // },
  images: {
    domains: [
      'images.unsplash.com',
      'i.pravatar.cc',
      'cdn-icons-png.flaticon.com',
      'localhost',
      'blackholejs.art'
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://blackholejs.art',
  },
};

export default nextConfig;
