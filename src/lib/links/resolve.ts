import { isMarketplaceHost, type Item } from "./marketplaces";
import { SHORT_LINK_HOSTS, parseItemUrl } from "./parse";

// Expands official marketplace short links on the server.
// SSRF guard: only http(s) URLs on the short-link allowlist or on marketplace
// domains are ever requested, redirects are followed by hand and re-checked at
// every hop, and responses are size- and time-limited.

export type ResolveResult = { ok: true; item: Item } | { ok: false; reason: "not-allowed" | "failed" };

const MAX_HOPS = 5;
const MAX_BODY_BYTES = 256_000;
const TIMEOUT_MS = 5_000;

function isAllowed(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  return (SHORT_LINK_HOSTS as readonly string[]).includes(host) || isMarketplaceHost(host);
}

async function readLimited(response: Response): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  const bytes = new Uint8Array(Math.min(total, MAX_BODY_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const slice = chunk.subarray(0, bytes.length - offset);
    bytes.set(slice, offset);
    offset += slice.length;
    if (offset >= bytes.length) break;
  }
  return new TextDecoder().decode(bytes);
}

/** Marketplace item URL embedded in an HTML page (m.tb.cn serves a script redirect). */
function itemFromHtml(html: string): Item | null {
  const text = html.replace(/\\\//g, "/").replace(/&amp;/g, "&");
  for (const match of text.matchAll(/https?:\/\/[^\s"'<>\\]+/g)) {
    try {
      const url = new URL(match[0]);
      if (!isMarketplaceHost(url.hostname)) continue;
      const item = parseItemUrl(url);
      if (item) return item;
    } catch {
      // not a URL, keep looking
    }
  }
  return null;
}

export async function resolveShortLink(input: string, fetchImpl: typeof fetch = fetch): Promise<ResolveResult> {
  let current: URL;
  try {
    current = new URL(input);
  } catch {
    return { ok: false, reason: "not-allowed" };
  }
  if (!isAllowed(current)) return { ok: false, reason: "not-allowed" };

  try {
    for (let hop = 0; hop < MAX_HOPS; hop++) {
      const response = await fetchImpl(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; MarisshipLinkResolver/1.0)",
          accept: "text/html,application/xhtml+xml",
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) return { ok: false, reason: "failed" };
        const next = new URL(location, current);
        const item = parseItemUrl(next);
        if (item && isMarketplaceHost(next.hostname)) return { ok: true, item };
        if (!isAllowed(next)) return { ok: false, reason: "failed" };
        current = next;
        continue;
      }

      if (!response.ok) return { ok: false, reason: "failed" };
      const item = itemFromHtml(await readLimited(response));
      return item ? { ok: true, item } : { ok: false, reason: "failed" };
    }
  } catch {
    return { ok: false, reason: "failed" };
  }
  return { ok: false, reason: "failed" };
}
