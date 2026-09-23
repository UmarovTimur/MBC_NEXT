import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const domain = (process.env.DOMAIN || "https://kitobook.com").replace(/\/+$/, "");
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";

  return {
    // Internal search results are also marked noindex on the page itself.
    rules: { userAgent: "*", allow: "/", disallow: `${basePath}/search` },
    sitemap: `${domain}${basePath}/sitemap.xml`,
  };
}
