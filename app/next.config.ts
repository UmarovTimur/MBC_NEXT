import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev']
};

export default nextConfig;
