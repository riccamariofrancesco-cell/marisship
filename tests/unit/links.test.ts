import { describe, expect, it } from "vitest";
import { agentLinks, converterAgents } from "@/data/agents";
import { canonicalUrl, parseMarketplaceUrl } from "@/lib/links/marketplaces";
import { extractUrl, parseInput, parseItemUrl } from "@/lib/links/parse";

// Synthetic item IDs: the tests check formats, not real listings.
const TB = "612345678901";
const WD = "7412345678";
const AL = "687654321012";

const item = (input: string) => {
  const result = parseInput(input);
  return result.kind === "item" ? result.item : null;
};

describe("marketplace links", () => {
  it.each([
    [`https://item.taobao.com/item.htm?id=${TB}&spm=a1z10.tracking`, { marketplace: "taobao", id: TB }],
    [`https://world.taobao.com/item/${TB}.htm?from=share`, { marketplace: "taobao", id: TB }],
    [`https://a.m.taobao.com/i${TB}.htm`, { marketplace: "taobao", id: TB }],
    [`https://m.intl.taobao.com/detail/detail.html?id=${TB}`, { marketplace: "taobao", id: TB }],
    [`https://detail.tmall.com/item.htm?id=${TB}&skuId=1`, { marketplace: "tmall", id: TB }],
    [`https://detail.m.tmall.com/item.htm?id=${TB}`, { marketplace: "tmall", id: TB }],
    [`https://weidian.com/item.html?itemID=${WD}&wfr=c`, { marketplace: "weidian", id: WD }],
    [`https://shop123.v.weidian.com/item.html?itemId=${WD}`, { marketplace: "weidian", id: WD }],
    [`https://detail.1688.com/offer/${AL}.html?spm=x`, { marketplace: "1688", id: AL }],
    [`https://m.1688.com/offer/${AL}.html`, { marketplace: "1688", id: AL }],
    [`https://detail.m.1688.com/page/index.html?offerId=${AL}`, { marketplace: "1688", id: AL }],
  ])("parses %s", (input, expected) => {
    expect(item(input)).toEqual(expected);
  });

  it("rejects lookalike domains and non-item pages", () => {
    expect(parseMarketplaceUrl(new URL(`https://taobao.com.evil.example/item.htm?id=${TB}`))).toBeNull();
    expect(parseMarketplaceUrl(new URL(`https://nottaobao.com/item.htm?id=${TB}`))).toBeNull();
    expect(parseMarketplaceUrl(new URL("https://www.taobao.com/"))).toBeNull();
    expect(parseMarketplaceUrl(new URL("https://item.taobao.com/item.htm?id=abc"))).toBeNull();
  });

  it("builds clean canonical links", () => {
    expect(canonicalUrl({ marketplace: "taobao", id: TB })).toBe(`https://item.taobao.com/item.htm?id=${TB}`);
    expect(canonicalUrl({ marketplace: "tmall", id: TB })).toBe(`https://detail.tmall.com/item.htm?id=${TB}`);
    expect(canonicalUrl({ marketplace: "weidian", id: WD })).toBe(`https://weidian.com/item.html?itemID=${WD}`);
    expect(canonicalUrl({ marketplace: "1688", id: AL })).toBe(`https://detail.1688.com/offer/${AL}.html`);
  });
});

describe("agent links", () => {
  const taobao = { marketplace: "taobao" as const, id: TB };

  it("round-trips through every converter agent for every marketplace", () => {
    for (const marketplace of ["taobao", "tmall", "weidian", "1688"] as const) {
      const source = { marketplace, id: marketplace === "weidian" ? WD : marketplace === "1688" ? AL : TB };
      for (const { agent, url } of agentLinks(source)) {
        const back = parseItemUrl(new URL(url));
        // Agents that only take an ID serve Tmall through the Taobao type.
        const expected =
          marketplace === "tmall" && (agent.slug === "cssbuy" || agent.slug === "lovegobuy")
            ? { marketplace: "taobao", id: TB }
            : source;
        expect(back, `${agent.slug} ${marketplace}`).toEqual(expected);
      }
    }
  });

  it("uses the verified formats", () => {
    const links = Object.fromEntries(agentLinks(taobao).map(({ agent, url }) => [agent.slug, url]));
    const encoded = encodeURIComponent(`https://item.taobao.com/item.htm?id=${TB}`);
    expect(links.superbuy).toBe(`https://www.superbuy.com/en/page/buy/?url=${encoded}`);
    expect(links.kakobuy).toBe(`https://www.kakobuy.com/item/details?url=${encoded}`);
    expect(links.sugargoo).toBe(`https://www.sugargoo.com/products?productLink=${encodeURIComponent(encoded)}`);
    expect(links.cssbuy).toBe(`https://www.cssbuy.com/shop/goodsDetail?type=taobao&id=${TB}`);
    expect(links.lovegobuy).toBe(`https://www.lovegobuy.com/product?id=${TB}&shop_type=taobao`);
    expect(agentLinks({ marketplace: "weidian", id: WD }).find((l) => l.agent.slug === "cssbuy")?.url).toBe(
      `https://www.cssbuy.com/shop/goodsDetail?type=micro&id=${WD}`,
    );
    expect(agentLinks({ marketplace: "1688", id: AL }).find((l) => l.agent.slug === "lovegobuy")?.url).toBe(
      `https://www.lovegobuy.com/product?id=${AL}&shop_type=ali_1688`,
    );
  });

  it("never adds affiliate or referral parameters", () => {
    for (const { url } of agentLinks(taobao)) {
      expect(url).not.toMatch(/(aff|ref|invite|partner|promo|code)=/i);
    }
  });

  it("only offers agents with a builder", () => {
    expect(converterAgents.map((a) => a.slug)).toEqual(["superbuy", "kakobuy", "sugargoo", "cssbuy", "lovegobuy"]);
  });

  it.each([
    [`https://www.cssbuy.com/item-${TB}.html`, { marketplace: "taobao", id: TB }],
    [`https://www.cssbuy.com/item-micro-${WD}.html`, { marketplace: "weidian", id: WD }],
    [`https://www.cssbuy.com/item-1688-${AL}.html`, { marketplace: "1688", id: AL }],
    [`https://cnfans.com/product?id=${TB}&platform=TAOBAO`, { marketplace: "taobao", id: TB }],
    [`https://www.acbuy.com/product?id=${WD}&source=WD`, { marketplace: "weidian", id: WD }],
    [
      `https://www.sugargoo.com/#/home/productDetail?productLink=${encodeURIComponent(`https://weidian.com/item.html?itemID=${WD}`)}`,
      { marketplace: "weidian", id: WD },
    ],
    [
      `https://www.pandabuy.com/product?ra=1&url=${encodeURIComponent(`https://detail.1688.com/offer/${AL}.html`)}`,
      { marketplace: "1688", id: AL },
    ],
  ])("recognises other agent link shapes: %s", (input, expected) => {
    expect(item(input)).toEqual(expected);
  });
});

describe("input handling", () => {
  it("finds the link inside a shared text", () => {
    const shared = `【淘宝】帆布包 大容量 https://item.taobao.com/item.htm?id=${TB} 点击链接直接打开`;
    expect(item(shared)).toEqual({ marketplace: "taobao", id: TB });
  });

  it("accepts links without a scheme", () => {
    expect(extractUrl(`detail.1688.com/offer/${AL}.html`)).toBe(`https://detail.1688.com/offer/${AL}.html`);
  });

  it("flags official short links for server expansion", () => {
    expect(parseInput("https://m.tb.cn/h.abcdEFG?tk=xyz")).toMatchObject({ kind: "short" });
    expect(parseInput("https://qr.1688.com/s/AbCd")).toMatchObject({ kind: "short" });
  });

  it("reports unknown input", () => {
    expect(parseInput("hello")).toMatchObject({ kind: "unknown" });
    expect(parseInput("https://example.com/item?id=123")).toMatchObject({ kind: "unknown" });
    expect(parseInput("javascript:alert(1)")).toMatchObject({ kind: "unknown" });
  });
});
