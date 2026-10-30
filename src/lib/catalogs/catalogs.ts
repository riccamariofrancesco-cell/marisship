import { z } from "zod";
import tmallPicks from "@/data/catalogs/tmall-picks.json";
import { categories } from "@/data/categories";
import { marketplaces } from "@/lib/links/marketplaces";

// Curated catalogs of legitimate products. Every catalog is a JSON file in
// src/data/catalogs/ registered below; the schema is checked at build time,
// so a malformed catalog fails the build instead of reaching the site.

const localized = z.object({ it: z.string().min(1).max(200), en: z.string().min(1).max(200) });

export const catalogItemSchema = z.object({
  marketplace: z.enum(marketplaces),
  id: z.string().regex(/^\d{6,20}$/),
  title: localized,
  category: z.enum(categories),
  /** Indicative price on the catalog's lastVerified date. */
  priceCny: z.number().positive().optional(),
});

export const catalogSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: localized,
  description: z.object({ it: z.string().min(1).max(400), en: z.string().min(1).max(400) }),
  curator: z.string().min(1).max(80),
  lastVerified: z.iso.date(),
  source: z.url().optional(),
  items: z.array(catalogItemSchema).min(1).max(5000),
});

export type Catalog = z.infer<typeof catalogSchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;

const sources: unknown[] = [tmallPicks];

export const catalogs: Catalog[] = sources.map((source) => catalogSchema.parse(source));
