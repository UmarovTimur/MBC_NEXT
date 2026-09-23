import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const domain = (process.env.DOMAIN || "https://kitobook.com").replace(/\/+$/, "");
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";

  return {
    // Deliberately open to every crawler, AI bots included (GPTBot, ClaudeBot,
    // PerplexityBot, …): being quotable in AI answers is a goal, so don't add
    // per-bot Disallow rules without a decision to leave that channel.
    // Internal search results are also marked noindex on the page itself.
    rules: { userAgent: "*", allow: "/", disallow: `${basePath}/search` },
    sitemap: `${domain}${basePath}/sitemap.xml`,
  };
}
