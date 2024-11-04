import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // You can add pathname pattern if needed, for example: '/images/**'
      },
    ],
  },
};

export default nextConfig;
