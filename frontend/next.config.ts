import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// crossOrigin: 'use-credentials',
	env: {
		GATEWAY_API: process.env.GATEWAY_API || 'http://localhost:6969',
	},
	// Enable strict mode for React
	reactStrictMode: true,
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
	images: {
		domains: [
			'images.unsplash.com',
			'i.pravatar.cc',
			'cdn-icons-png.flaticon.com',
			'localhost'
		],
	},
};

export default nextConfig;
