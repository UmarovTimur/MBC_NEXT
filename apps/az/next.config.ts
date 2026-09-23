import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mbc/ui", "@mbc/bible-reader", "@mbc/bible-verses"],

  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  basePath: process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "",
  images: {
    loaderFile: "./src/shared/image-loader.ts",
  },
  // One URL shape site-wide: "/books/", not "/books". Next 308-redirects the
  // slashless form and <Link> emits the slashed one. Do NOT re-add
  // skipTrailingSlashRedirect — it also stops <Link> from normalizing hrefs.
  trailingSlash: true,
};

export default nextConfig;
