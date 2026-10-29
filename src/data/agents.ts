import { canonicalUrl, type Item, type Marketplace } from "@/lib/links/marketplaces";

// Agents listed by Marisship. An agent gets a `buildUrl` only after its link
// format has been verified on its own website (see `lastChecked`): links taken
// from the agent's pages, or a product page that renders for a real item.
// No affiliate or referral parameters are ever added.

export interface Agent {
  slug: string;
  name: string;
  website: string;
  lastChecked: string;
  /** Marketplaces the converter can build links for. Empty = listed only. */
  marketplaces: Marketplace[];
  buildUrl?: (item: Item) => string;
}

const all: Marketplace[] = ["taobao", "tmall", "weidian", "1688"];

export const agents: Agent[] = [
  {
    // Format used by the links on superbuy.com's own home page.
    slug: "superbuy",
    name: "Superbuy",
    website: "https://www.superbuy.com",
    lastChecked: "2026-10-29",
    marketplaces: all,
    buildUrl: (item) => `https://www.superbuy.com/en/page/buy/?url=${encodeURIComponent(canonicalUrl(item))}`,
  },
  {
    // /item/details?url=<marketplace link> renders the item page.
    slug: "kakobuy",
    name: "Kakobuy",
    website: "https://www.kakobuy.com",
    lastChecked: "2026-10-29",
    marketplaces: all,
    buildUrl: (item) => `https://www.kakobuy.com/item/details?url=${encodeURIComponent(canonicalUrl(item))}`,
  },
  {
    // sugargoo.com links its products with a double-encoded productLink.
    slug: "sugargoo",
    name: "Sugargoo",
    website: "https://www.sugargoo.com",
    lastChecked: "2026-10-29",
    marketplaces: all,
    buildUrl: (item) =>
      `https://www.sugargoo.com/products?productLink=${encodeURIComponent(encodeURIComponent(canonicalUrl(item)))}`,
  },
  {
    // Legacy item-<id>.html links redirect to goodsDetail?type=taobao|micro|1688.
    // Tmall items are served through the Taobao type.
    slug: "cssbuy",
    name: "CSSBuy",
    website: "https://www.cssbuy.com",
    lastChecked: "2026-10-29",
    marketplaces: all,
    buildUrl: (item) => {
      const type = { taobao: "taobao", tmall: "taobao", weidian: "micro", "1688": "1688" }[item.marketplace];
      return `https://www.cssbuy.com/shop/goodsDetail?type=${type}&id=${item.id}`;
    },
  },
  {
    // product?id=&shop_type=taobao|weidian|ali_1688 (values from the site's own code).
    slug: "lovegobuy",
    name: "LoveGoBuy",
    website: "https://www.lovegobuy.com",
    lastChecked: "2026-10-29",
    marketplaces: all,
    buildUrl: (item) => {
      const shopType = { taobao: "taobao", tmall: "taobao", weidian: "weidian", "1688": "ali_1688" }[item.marketplace];
      return `https://www.lovegobuy.com/product?id=${item.id}&shop_type=${shopType}`;
    },
  },
  // Listed only: their sites answered on the check date, but the product link
  // format could not be verified without an account.
  { slug: "acbuy", name: "ACBuy", website: "https://www.acbuy.com", lastChecked: "2026-10-29", marketplaces: [] },
  { slug: "basetao", name: "Basetao", website: "https://www.basetao.com", lastChecked: "2026-10-29", marketplaces: [] },
  { slug: "hoobuy", name: "HooBuy", website: "https://hoobuy.com", lastChecked: "2026-10-29", marketplaces: [] },
  { slug: "litbuy", name: "LitBuy", website: "https://www.litbuy.com", lastChecked: "2026-10-29", marketplaces: [] },
  { slug: "oopbuy", name: "Oopbuy", website: "https://oopbuy.com", lastChecked: "2026-10-29", marketplaces: [] },
];

export const converterAgents = agents.filter(
  (agent): agent is Agent & { buildUrl: (item: Item) => string } => agent.buildUrl !== undefined,
);

export function agentLinks(item: Item): { agent: Agent; url: string }[] {
  return converterAgents
    .filter((agent) => agent.marketplaces.includes(item.marketplace))
    .map((agent) => ({ agent, url: agent.buildUrl(item) }));
}
