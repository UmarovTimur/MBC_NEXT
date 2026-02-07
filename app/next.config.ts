import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  // assetPrefix: process.env.NODE_ENV === "production" ? "/out" : undefined,
  // assetPrefix: "/mcdonald",
  // basePath: "/mcdonald",
  images: {
    unoptimized: true, // для static export рекомендуется, чтобы не было ошибок
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
