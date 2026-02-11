import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  basePath: process.env.NODE_ENV === "production" ? "/mcdonald" : "",
  images: {
    unoptimized: true, // для static export рекомендуется, чтобы не было ошибок
    loader: "custom",
    loaderFile: "./src/shared/ui/ImageLoader.tsx",
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
