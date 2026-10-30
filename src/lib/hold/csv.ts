import { MAX_ITEMS, type NewItemInput } from "./hold";

// CSV import for the Hold. Handles comma, semicolon (Excel in Italian) and tab
// separators, quoted fields, and headers in Italian, English or Chinese.
// Exports from Google Sheets (File → Download → CSV) work as they are.

export const MAX_ROWS = MAX_ITEMS;

type Delimiter = "," | ";" | "\t";

export function detectDelimiter(text: string): Delimiter {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const unquoted = firstLine.replace(/"[^"]*"/g, "");
  const counts: [Delimiter, number][] = [",", ";", "\t"].map((d) => [d as Delimiter, unquoted.split(d).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

/** RFC 4180 parser: quoted fields may contain separators, quotes ("") and newlines. */
export function parseCsv(text: string, delimiter: Delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.map((r) => r.map((cell) => cell.trim())).filter((r) => r.some((cell) => cell !== ""));
}

/** "59,90", "¥ 1.234,50", "1,234.50", "12 CNY" → number; NaN when not a number. */
export function parseLocaleNumber(value: string): number {
  let v = value.replace(/[^\d.,-]/g, "");
  if (!v) return Number.NaN;
  const lastComma = v.lastIndexOf(",");
  const lastDot = v.lastIndexOf(".");
  if (lastComma > lastDot) v = v.replace(/\./g, "").replace(",", ".");
  else v = v.replace(/,/g, "");
  return Number(v);
}

/** Weight in grams; values marked "kg" are converted. */
export function parseWeight(value: string): number {
  const number = parseLocaleNumber(value);
  return /kg|公斤|千克/i.test(value) ? number * 1000 : number;
}

type Field = "url" | "title" | "price" | "qty" | "weight";

const headerWords: Record<Field, string[]> = {
  url: ["link", "url", "链接", "地址"],
  title: ["name", "title", "item", "product", "nome", "titolo", "articolo", "prodotto", "名称", "商品", "标题"],
  price: ["price", "prezzo", "cost", "costo", "cny", "yuan", "rmb", "价格", "单价", "售价"],
  qty: ["qty", "quantity", "quantita", "q.ta", "pcs", "pezzi", "数量", "件数"],
  weight: ["weight", "peso", "grams", "grammi", "重量"],
};

function normalizeHeader(cell: string): string {
  return cell.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function columnFor(header: string): Field | undefined {
  const h = normalizeHeader(header);
  // "link" is checked first so that "product link" maps to the URL column.
  const order: Field[] = ["url", "price", "qty", "weight", "title"];
  return order.find((field) => headerWords[field].some((word) => h.includes(word)));
}

const LOOKS_LIKE_URL = /^(https?:\/\/|[\w-]+\.(taobao|tmall|weidian|1688)\.com)/i;

export interface CsvMapping {
  items: NewItemInput[];
  skipped: number;
}

/**
 * Maps CSV rows to Hold items. With a header row, columns are matched by
 * name; without one, the first column that looks like a link is used as the
 * link and the first other text column as the name.
 */
export function rowsToItems(rows: string[][]): CsvMapping {
  if (!rows.length) return { items: [], skipped: 0 };
  const columns = rows[0].map(columnFor);
  const hasHeader = columns.some(Boolean) && !rows[0].some((cell) => LOOKS_LIKE_URL.test(cell));

  let index: Partial<Record<Field, number>> = {};
  let data = rows;
  if (hasHeader) {
    columns.forEach((field, i) => {
      if (field && index[field] === undefined) index[field] = i;
    });
    data = rows.slice(1);
  } else {
    const sample = rows[0];
    const url = sample.findIndex((cell) => LOOKS_LIKE_URL.test(cell));
    const title = sample.findIndex((cell, i) => i !== url && cell && Number.isNaN(parseLocaleNumber(cell)));
    index = { url: url === -1 ? undefined : url, title: title === -1 ? undefined : title };
  }

  const items: NewItemInput[] = [];
  let skipped = 0;
  for (const row of data.slice(0, MAX_ROWS)) {
    const cell = (field: Field) => (index[field] !== undefined ? (row[index[field]!] ?? "") : "");
    const url = cell("url");
    const title = cell("title");
    if (!url && !title) {
      skipped++;
      continue;
    }
    const qty = parseLocaleNumber(cell("qty"));
    items.push({
      url,
      title,
      priceCny: parseLocaleNumber(cell("price")) || 0,
      qty: Number.isNaN(qty) ? 1 : qty,
      weightG: parseWeight(cell("weight")) || 0,
    });
  }
  skipped += Math.max(0, data.length - MAX_ROWS);
  return { items, skipped };
}
