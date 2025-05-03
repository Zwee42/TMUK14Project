import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  devIndicators: false,
  eslint: {
    // Disable ESLint during the build
    ignoreDuringBuilds: true,
  },
  output: 'export',


};

export default nextConfig;
