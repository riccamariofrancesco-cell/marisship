import { describe, expect, it } from "vitest";
import { categories, type Category } from "@/data/categories";
import { stores } from "@/data/stores";
import { catalogSchema, catalogs } from "@/lib/catalogs/catalogs";
import { normalize, searchCatalogs } from "@/lib/catalogs/search";
import en from "@/i18n/messages/en.json";
import it_ from "@/i18n/messages/it.json";

const labels = en.categories as Record<Category, string>;

describe("catalogs", () => {
  it("are valid, with unique ids and unique items per catalog", () => {
    expect(catalogs.length).toBeGreaterThan(0);
    expect(new Set(catalogs.map((c) => c.id)).size).toBe(catalogs.length);
    for (const catalog of catalogs) {
      const keys = catalog.items.map((i) => `${i.marketplace}:${i.id}`);
      expect(new Set(keys).size, catalog.id).toBe(keys.length);
    }
  });

  it("reject items without a valid id or category", () => {
    const base = catalogs[0];
    const bad = { ...base, items: [{ ...base.items[0], id: "abc" }] };
    expect(catalogSchema.safeParse(bad).success).toBe(false);
    const badCategory = { ...base, items: [{ ...base.items[0], category: "replicas" }] };
    expect(catalogSchema.safeParse(badCategory).success).toBe(false);
  });

  it("have labels for every category in both languages", () => {
    for (const category of categories) {
      expect(en.categories[category]).toBeTruthy();
      expect(it_.categories[category]).toBeTruthy();
    }
  });
});

describe("catalog search", () => {
  it("normalizes accents", () => {
    expect(normalize("Caffè ÀÉ")).toBe("caffe ae");
  });

  it("matches words in either language and ranks title matches first", () => {
    const hits = searchCatalogs(catalogs, "tazza", {}, "it", labels);
    expect(hits.map((h) => h.item.id)).toContain("898600257194");
    const english = searchCatalogs(catalogs, "ceramic cup", {}, "en", labels);
    expect(english[0].item.id).toBe("898600257194");
  });

  it("requires every word to match", () => {
    expect(searchCatalogs(catalogs, "cup bicycle", {}, "en", labels)).toEqual([]);
  });

  it("matches category labels and filters", () => {
    const toys = searchCatalogs(catalogs, "", { category: "toys" }, "en", labels);
    expect(toys.length).toBeGreaterThan(0);
    expect(toys.every((h) => h.item.category === "toys")).toBe(true);
    const cheap = searchCatalogs(catalogs, "", { maxPriceCny: 50 }, "en", labels);
    expect(cheap.every((h) => (h.item.priceCny ?? Infinity) <= 50)).toBe(true);
    expect(searchCatalogs(catalogs, "", { catalogId: "missing" }, "en", labels)).toEqual([]);
  });
});

describe("official stores", () => {
  it("have unique slugs and https Tmall URLs", () => {
    expect(new Set(stores.map((s) => s.slug)).size).toBe(stores.length);
    for (const store of stores) {
      expect(store.url).toMatch(/^https:\/\/[a-z0-9-]+\.tmall\.com\/$/);
      expect(store.shopName).toMatch(/旗舰店$/);
      expect(categories).toContain(store.category);
    }
  });

  it("leave out the lookalike huawei.tmall.com store", () => {
    expect(stores.some((s) => s.url.includes("huawei"))).toBe(false);
  });
});
