import { NextRequest } from "next/server";

// Same-origin endpoint the report widget posts to — keeps PAYLOAD_API_URL
// server-only, never sent to the browser. Mirrors /api/search/route.ts.
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // This app's own fetch below is the "client" from the admin's point of
  // view, so without forwarding it explicitly the admin would rate-limit by
  // this server's IP instead of the visitor's.
  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  const res = await fetch(`${PAYLOAD_API_URL}/api/content-reports/submit`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
      ...(userAgent ? { "user-agent": userAgent } : {}),
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
