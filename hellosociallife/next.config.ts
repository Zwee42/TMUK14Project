import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // CORS configuration
  allowedDevOrigins: ['http://212.25.142.1', 'http://localhost:3040'],
};

export default nextConfig;
