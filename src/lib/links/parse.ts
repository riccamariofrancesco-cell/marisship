import { isMarketplaceHost, parseMarketplaceUrl, type Item, type Marketplace } from "./marketplaces";

/** Official marketplace short-link domains that the server may expand. */
export const SHORT_LINK_HOSTS = ["m.tb.cn", "e.tb.cn", "tb.cn", "qr.1688.com", "k.youshop10.com"] as const;

export type ParseResult =
  | { kind: "item"; item: Item; input: string }
  | { kind: "short"; url: string; input: string }
  | { kind: "unknown"; input: string };

const URL_IN_TEXT = /https?:\/\/[^\s<>"'，。；、）)】]+/i;
const BARE_HOST = /^(?:[\w-]+\.)+(?:com|cn|hk)\/\S*$/i;

/**
 * Finds the first URL in a line of text. Handles the share texts copied from
 * Chinese apps (title + link + emoji) and links pasted without a scheme.
 */
export function extractUrl(text: string): string | null {
  const trimmed = text.trim();
  const match = trimmed.match(URL_IN_TEXT);
  if (match) return match[0].replace(/[.,;!?]+$/, "");
  if (BARE_HOST.test(trimmed)) return `https://${trimmed}`;
  return null;
}

function toUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Query parameters, including those inside a SPA hash such as `#/detail?url=…`. */
function allParams(url: URL): URLSearchParams[] {
  const params = [url.searchParams];
  const q = url.hash.indexOf("?");
  if (q !== -1) params.push(new URLSearchParams(url.hash.slice(q + 1)));
  return params;
}

/** Agent links that embed the original marketplace link, possibly encoded more than once. */
function nestedMarketplaceItem(url: URL): Item | null {
  for (const params of allParams(url)) {
    for (const value of params.values()) {
      let candidate = value;
      for (let depth = 0; depth < 3; depth++) {
        if (/^https?:\/\//i.test(candidate)) {
          const nested = toUrl(candidate);
          const item = nested && parseMarketplaceUrl(nested);
          if (item) return item;
        }
        const decoded = safeDecode(candidate);
        if (decoded === candidate) break;
        candidate = decoded;
      }
    }
  }
  return null;
}

const PLATFORM_ALIASES: Record<string, Marketplace> = {
  taobao: "taobao",
  tb: "taobao",
  tmall: "tmall",
  tm: "tmall",
  weidian: "weidian",
  wd: "weidian",
  micro: "weidian",
  "1688": "1688",
  ali_1688: "1688",
  ali1688: "1688",
  al: "1688",
  alibaba: "1688",
};
const ID_PARAMS = ["id", "itemId", "itemID", "goodsId", "goods_id", "productId", "offerId"];
const PLATFORM_PARAMS = ["shop_type", "shopType", "platform", "source", "type", "channel"];

/** Agent links that carry the item as `id` + platform parameters (e.g. ?id=…&shop_type=weidian). */
function idAndPlatformItem(url: URL): Item | null {
  for (const params of allParams(url)) {
    const id = ID_PARAMS.map((name) => params.get(name)).find((v) => v && /^\d{6,20}$/.test(v));
    const platform = PLATFORM_PARAMS.map((name) => params.get(name)?.toLowerCase()).find(
      (v) => v && v in PLATFORM_ALIASES,
    );
    if (id && platform) return { marketplace: PLATFORM_ALIASES[platform], id };
  }
  return null;
}

/** Agent links with the item in the path. */
function pathItem(url: URL): Item | null {
  const css = url.pathname.match(/^\/item-(?:(micro|1688)-)?(\d{6,20})\.html$/i);
  if (css) {
    const marketplace: Marketplace = css[1] === "micro" ? "weidian" : css[1] === "1688" ? "1688" : "taobao";
    return { marketplace, id: css[2] };
  }
  const generic = url.pathname.match(/\/(taobao|tmall|weidian|1688)\/(\d{6,20})(?:\.html?)?(?:\/|$)/i);
  if (generic) return { marketplace: PLATFORM_ALIASES[generic[1].toLowerCase()], id: generic[2] };
  return null;
}

export function parseItemUrl(url: URL): Item | null {
  if (isMarketplaceHost(url.hostname)) return parseMarketplaceUrl(url);
  return nestedMarketplaceItem(url) ?? pathItem(url) ?? idAndPlatformItem(url);
}

export function isShortLink(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return (SHORT_LINK_HOSTS as readonly string[]).includes(host);
}

/** Parses one line typed or pasted by the user. */
export function parseInput(input: string): ParseResult {
  const raw = extractUrl(input);
  const url = raw ? toUrl(raw) : null;
  if (!url) return { kind: "unknown", input };
  if (isShortLink(url)) return { kind: "short", url: url.toString(), input };
  const item = parseItemUrl(url);
  return item ? { kind: "item", item, input } : { kind: "unknown", input };
}
