import { resolveShortLink } from "@/lib/links/resolve";

// Expands an official marketplace short link for the converter.
// POST keeps the link out of URLs and request logs; nothing is stored.

const NO_STORE = { "cache-control": "no-store" };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ ok: false, reason: "forbidden" }, { status: 403, headers: NO_STORE });
  }

  const body = await request.text();
  if (body.length > 4096) {
    return Response.json({ ok: false, reason: "too-large" }, { status: 413, headers: NO_STORE });
  }

  let url: unknown;
  try {
    url = (JSON.parse(body) as { url?: unknown }).url;
  } catch {
    url = undefined;
  }
  if (typeof url !== "string") {
    return Response.json({ ok: false, reason: "bad-request" }, { status: 400, headers: NO_STORE });
  }

  const result = await resolveShortLink(url);
  return Response.json(result, { status: result.ok ? 200 : 422, headers: NO_STORE });
}
