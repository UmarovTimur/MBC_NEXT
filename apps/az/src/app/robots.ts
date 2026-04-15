import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const domain = process.env.DOMAIN || "https://kitobook.com/";
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${domain}${basePath}/sitemap.xml`,
  };
}
