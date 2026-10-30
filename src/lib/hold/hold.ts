import { z } from "zod";
import { canonicalUrl, marketplaces } from "@/lib/links/marketplaces";
import { parseInput } from "@/lib/links/parse";
import { readLocal, writeLocal } from "@/lib/local-store";

// The Hold: a haul planner kept in the visitor's own browser.

export const STORAGE_KEY = "marisship:hold:v1";

export const holdItemSchema = z.object({
  id: z.string().min(1).max(64),
  url: z.string().max(2048),
  title: z.string().max(200),
  priceCny: z.number().nonnegative(),
  qty: z.number().int().positive().max(999),
  weightG: z.number().nonnegative(),
  marketplace: z.enum(marketplaces).optional(),
  itemId: z.string().regex(/^\d{6,20}$/).optional(),
});

export type HoldItem = z.infer<typeof holdItemSchema>;

const holdFileSchema = z.object({
  app: z.literal("marisship"),
  kind: z.literal("hold"),
  version: z.literal(1),
  items: z.array(holdItemSchema).max(500),
});

export interface NewItemInput {
  url: string;
  title: string;
  priceCny: number;
  qty: number;
  weightG: number;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Builds an item, replacing a recognised link with its clean marketplace URL. */
export function createItem(input: NewItemInput): { item: HoldItem; recognised: boolean } {
  const parsed = parseInput(input.url);
  const base = {
    id: newId(),
    title: input.title.trim().slice(0, 200),
    priceCny: Math.max(0, input.priceCny || 0),
    qty: Math.min(999, Math.max(1, Math.round(input.qty || 1))),
    weightG: Math.max(0, input.weightG || 0),
  };
  if (parsed.kind === "item") {
    return {
      item: { ...base, url: canonicalUrl(parsed.item), marketplace: parsed.item.marketplace, itemId: parsed.item.id },
      recognised: true,
    };
  }
  return { item: { ...base, url: input.url.trim().slice(0, 2048) }, recognised: false };
}

export function totals(items: HoldItem[]): { count: number; priceCny: number; weightG: number } {
  return items.reduce(
    (acc, item) => ({
      count: acc.count + item.qty,
      priceCny: Math.round((acc.priceCny + item.priceCny * item.qty) * 100) / 100,
      weightG: acc.weightG + item.weightG * item.qty,
    }),
    { count: 0, priceCny: 0, weightG: 0 },
  );
}

export function serializeHold(items: HoldItem[]): string {
  return JSON.stringify({ app: "marisship", kind: "hold", version: 1, items }, null, 2);
}

export function parseHoldFile(text: string): HoldItem[] | null {
  try {
    const result = holdFileSchema.safeParse(JSON.parse(text));
    return result.success ? result.data.items : null;
  } catch {
    return null;
  }
}

export function itemsFromStorage(raw: string | null): HoldItem[] {
  return raw ? (parseHoldFile(raw) ?? []) : [];
}

export function loadHold(): HoldItem[] {
  return itemsFromStorage(readLocal(STORAGE_KEY));
}

export function saveHold(items: HoldItem[]): boolean {
  return writeLocal(STORAGE_KEY, items.length ? serializeHold(items) : null);
}
