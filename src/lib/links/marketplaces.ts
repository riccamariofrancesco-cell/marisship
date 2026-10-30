export const marketplaces = ["taobao", "tmall", "weidian", "1688"] as const;
export type Marketplace = (typeof marketplaces)[number];

export interface Item {
  marketplace: Marketplace;
  id: string;
}

export const marketplaceNames: Record<Marketplace, string> = {
  taobao: "Taobao",
  tmall: "Tmall",
  weidian: "Weidian",
  "1688": "1688",
};

/** Canonical item URL, without tracking parameters. */
export function canonicalUrl(item: Item): string {
  switch (item.marketplace) {
    case "taobao":
      return `https://item.taobao.com/item.htm?id=${item.id}`;
    case "tmall":
      return `https://detail.tmall.com/item.htm?id=${item.id}`;
    case "weidian":
      return `https://weidian.com/item.html?itemID=${item.id}`;
    case "1688":
      return `https://detail.1688.com/offer/${item.id}.html`;
  }
}

const ITEM_ID = /^\d{6,20}$/;

function isHost(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function numericParam(url: URL, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = url.searchParams.get(name);
    if (value && ITEM_ID.test(value)) return value;
  }
  return undefined;
}

/** Reads an item from a Taobao, Tmall, Weidian or 1688 URL (desktop or mobile). */
export function parseMarketplaceUrl(url: URL): Item | null {
  const host = url.hostname.toLowerCase();

  if (isHost(host, "tmall.com") || isHost(host, "tmall.hk")) {
    const id = numericParam(url, "id");
    return id ? { marketplace: "tmall", id } : null;
  }

  if (isHost(host, "taobao.com")) {
    const id =
      numericParam(url, "id") ??
      url.pathname.match(/^\/item\/(\d{6,20})\.htm/)?.[1] ?? // world.taobao.com/item/<id>.htm
      url.pathname.match(/^\/i(\d{6,20})\.htm/)?.[1]; // a.m.taobao.com/i<id>.htm
    return id ? { marketplace: "taobao", id } : null;
  }

  if (isHost(host, "weidian.com") || isHost(host, "koudai.com")) {
    const id = numericParam(url, "itemID", "itemId", "itemid");
    return id ? { marketplace: "weidian", id } : null;
  }

  if (isHost(host, "1688.com")) {
    const id =
      url.pathname.match(/\/offer\/(\d{6,20})\.html/)?.[1] ?? numericParam(url, "offerId", "offerid");
    return id ? { marketplace: "1688", id } : null;
  }

  return null;
}

export function isMarketplaceHost(host: string): boolean {
  const h = host.toLowerCase();
  return ["taobao.com", "tmall.com", "tmall.hk", "weidian.com", "koudai.com", "1688.com"].some((d) => isHost(h, d));
}
