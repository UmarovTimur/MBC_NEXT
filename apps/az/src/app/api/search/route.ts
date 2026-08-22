import { NextRequest } from "next/server";
import { fetchSearchPage, parseTestament } from "@/widgets/BibleSearch/lib/searchVerses";

// Same-origin endpoint the client-side infinite scroll fetches subsequent
// pages from — keeps PAYLOAD_API_URL server-only, never sent to the browser.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();
  const page = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);
  const exact = searchParams.get("exact") === "1";
  const testament = parseTestament(searchParams.get("testament"));

  if (query.length < 2) {
    return Response.json({ total: 0, page, limit: 0, results: [] });
  }

  const response = await fetchSearchPage(query, page, { exact, testament });
  return Response.json(response);
}
