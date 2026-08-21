import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mbc/ui", "@mbc/bible-reader", "@mbc/bible-verses"],

  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  basePath: process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "",
  images: {
    loaderFile: "./src/shared/image-loader.ts",
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
