import { describe, expect, it } from "vitest";
import { detectDelimiter, parseCsv, parseLocaleNumber, parseWeight, rowsToItems } from "@/lib/hold/csv";

describe("CSV parsing", () => {
  it("detects the separator", () => {
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
    expect(detectDelimiter("a\tb\tc")).toBe("\t");
    expect(detectDelimiter('"x;y",b,c')).toBe(",");
  });

  it("handles quotes, escaped quotes, newlines in fields and BOM", () => {
    const csv = '﻿name,link\n"Mug ""Starry""",https://a.example\n"two\nlines",x\n\n';
    expect(parseCsv(csv)).toEqual([
      ["name", "link"],
      ['Mug "Starry"', "https://a.example"],
      ["two\nlines", "x"],
    ]);
  });

  it("parses Italian and English numbers", () => {
    expect(parseLocaleNumber("59,90")).toBe(59.9);
    expect(parseLocaleNumber("¥ 1.234,50")).toBe(1234.5);
    expect(parseLocaleNumber("1,234.50")).toBe(1234.5);
    expect(parseLocaleNumber("12 CNY")).toBe(12);
    expect(parseLocaleNumber("")).toBeNaN();
    expect(parseWeight("1,2 kg")).toBe(1200);
    expect(parseWeight("350 g")).toBe(350);
  });
});

describe("rows to Hold items", () => {
  it("maps Italian headers from an Excel export", () => {
    const rows = parseCsv(
      "Nome;Link articolo;Prezzo (CNY);Quantità;Peso (g)\nTazza;https://item.taobao.com/item.htm?id=612345678901;35,5;2;300",
    );
    expect(rowsToItems(rows)).toEqual({
      items: [
        { url: "https://item.taobao.com/item.htm?id=612345678901", title: "Tazza", priceCny: 35.5, qty: 2, weightG: 300 },
      ],
      skipped: 0,
    });
  });

  it("maps English and Chinese headers", () => {
    const en = rowsToItems(parseCsv("Item link,Name or note,Unit price (CNY),Qty,Weight per unit (g)\nhttps://x.tmall.com/item.htm?id=1,Bag,10,1,0.5 kg"));
    expect(en.items[0]).toMatchObject({ title: "Bag", priceCny: 10, qty: 1, weightG: 500 });
    const zh = rowsToItems(parseCsv("商品名称,商品链接,价格,数量,重量\n杯子,https://weidian.com/item.html?itemID=7412345678,20,3,200"));
    expect(zh.items[0]).toMatchObject({ title: "杯子", priceCny: 20, qty: 3, weightG: 200 });
  });

  it("works without a header row", () => {
    const rows = parseCsv("Tea set,https://detail.1688.com/offer/687654321012.html\nLamp,https://item.taobao.com/item.htm?id=612345678901");
    const { items } = rowsToItems(rows);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ title: "Tea set", url: "https://detail.1688.com/offer/687654321012.html", qty: 1 });
  });

  it("skips empty rows and caps the size", () => {
    const body = Array.from({ length: 510 }, (_, i) => `Item ${i},`).join("\n");
    // The blank row is dropped by the parser; 510 rows remain, capped at 500.
    const { items, skipped } = rowsToItems(parseCsv(`name,link\n,\n${body}`));
    expect(items).toHaveLength(500);
    expect(skipped).toBe(10);
    expect(rowsToItems(parseCsv("name,link\nok,\n , ")).items).toHaveLength(1);
  });
});
