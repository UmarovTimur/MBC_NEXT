// Same-origin visit counter for the footer — proxies to the admin, which
// stores the number (admin src/endpoints/visits.ts). Keeps PAYLOAD_API_URL
// server-only, mirrors /api/content-reports/route.ts.
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL ?? "http://localhost:8001";

export const dynamic = "force-dynamic";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

async function forward(method: "GET" | "POST") {
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api/visits`, { method, cache: "no-store" });
    return new Response(await res.text(), { status: res.status, headers });
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), { status: 502, headers });
  }
}

export const GET = () => forward("GET");
export const POST = () => forward("POST");

const notAllowed = () =>
  new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { ...headers, allow: "GET, POST" },
  });

export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;
