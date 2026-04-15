import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mbc/ui", "@mbc/bible-reader"],
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  basePath: process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
