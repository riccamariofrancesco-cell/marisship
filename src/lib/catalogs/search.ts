import type { Category } from "@/data/categories";
import type { Locale } from "@/i18n/config";
import type { Marketplace } from "@/lib/links/marketplaces";
import type { Catalog, CatalogItem } from "./catalogs";

export interface SearchHit {
  catalog: Catalog;
  item: CatalogItem;
  score: number;
}

export interface SearchFilters {
  catalogId?: string;
  category?: Category;
  marketplace?: Marketplace;
  maxPriceCny?: number;
}

/** Lowercase, without accents, so "caffè" matches "caffe". */
export function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Searches every catalog at once. All query words must match somewhere in
 * the item (titles in both languages, category labels, catalog title, item
 * ID); words found in the title count double. Empty queries list everything
 * that passes the filters.
 */
export function searchCatalogs(
  catalogs: Catalog[],
  query: string,
  filters: SearchFilters,
  locale: Locale,
  categoryLabels: Record<Category, string>,
): SearchHit[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];

  for (const catalog of catalogs) {
    if (filters.catalogId && catalog.id !== filters.catalogId) continue;
    for (const item of catalog.items) {
      if (filters.category && item.category !== filters.category) continue;
      if (filters.marketplace && item.marketplace !== filters.marketplace) continue;
      if (filters.maxPriceCny !== undefined && (item.priceCny === undefined || item.priceCny > filters.maxPriceCny)) {
        continue;
      }
      const title = normalize(`${item.title.it} ${item.title.en}`);
      const rest = normalize(
        `${categoryLabels[item.category]} ${item.category} ${catalog.title.it} ${catalog.title.en} ${item.marketplace} ${item.id}`,
      );
      let score = 0;
      let matchedAll = true;
      for (const word of words) {
        if (title.includes(word)) score += 2;
        else if (rest.includes(word)) score += 1;
        else {
          matchedAll = false;
          break;
        }
      }
      if (matchedAll) hits.push({ catalog, item, score });
    }
  }

  return hits.sort(
    (a, b) => b.score - a.score || a.item.title[locale].localeCompare(b.item.title[locale], locale),
  );
}
