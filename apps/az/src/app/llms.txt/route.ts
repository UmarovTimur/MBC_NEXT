import { getI18n } from "@/app/providers/I18n/server";

export const dynamic = "force-static";

/** llms.txt: a short map of the site for LLM crawlers (https://llmstxt.org). */
export function GET() {
  const { t } = getI18n();
  const domain = (process.env.DOMAIN || "https://kitobook.com").replace(/\/+$/, "");
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";
  const url = (path: string) => `${domain}${basePath}${path}`;

  const body = `# Incilaz

> ${t("homeHeroDescription")}

## Sections

- [Müqəddəs Kitab](${url("/azb/")}): the Bible in Azerbaijani, every book and chapter, with audio recordings.
- [Barclay şərhləri](${url("/barclay/")}): William Barclay's New Testament commentary in Azerbaijani.
- [Kitablar](${url("/books/")}): Christian books in Azerbaijani, free to read online.
- [Simfoniya](${url("/simfoniya/")}): a concordance of words found in the Bible, alphabetical.

## Optional

- [Sitemap](${url("/sitemap.xml")}): every chapter and page.
`;

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
