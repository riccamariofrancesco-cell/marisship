import { describe, expect, it } from "vitest";
import { createItem, parseHoldFile, serializeHold, totals } from "@/lib/hold/hold";

describe("the Hold", () => {
  it("cleans recognised links", () => {
    const { item, recognised } = createItem({
      url: "https://item.taobao.com/item.htm?id=612345678901&spm=tracking",
      title: " Canvas bag ",
      priceCny: 59.9,
      qty: 2,
      weightG: 350,
    });
    expect(recognised).toBe(true);
    expect(item).toMatchObject({
      url: "https://item.taobao.com/item.htm?id=612345678901",
      title: "Canvas bag",
      marketplace: "taobao",
      itemId: "612345678901",
    });
  });

  it("keeps unrecognised links as typed and clamps numbers", () => {
    const { item, recognised } = createItem({ url: "my note", title: "", priceCny: -5, qty: 0, weightG: Number.NaN });
    expect(recognised).toBe(false);
    expect(item).toMatchObject({ url: "my note", priceCny: 0, qty: 1, weightG: 0 });
  });

  it("adds up price and weight by quantity", () => {
    const a = createItem({ url: "a", title: "a", priceCny: 10.1, qty: 3, weightG: 200 }).item;
    const b = createItem({ url: "b", title: "b", priceCny: 0.2, qty: 1, weightG: 50 }).item;
    expect(totals([a, b])).toEqual({ count: 4, priceCny: 30.5, weightG: 650 });
  });

  it("round-trips exports and rejects foreign files", () => {
    const items = [createItem({ url: "a", title: "a", priceCny: 1, qty: 1, weightG: 1 }).item];
    expect(parseHoldFile(serializeHold(items))).toEqual(items);
    expect(parseHoldFile("{}")).toBeNull();
    expect(parseHoldFile("not json")).toBeNull();
    expect(parseHoldFile(JSON.stringify({ app: "marisship", kind: "hold", version: 1, items: [{ id: "x" }] }))).toBeNull();
  });
});
