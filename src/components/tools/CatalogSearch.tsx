"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { CheckIcon, CrateIcon, ExternalIcon } from "@/components/icons";
import { Field, toNumber } from "@/components/ui/Field";
import { agentLinks, converterAgents } from "@/data/agents";
import type { Category } from "@/data/categories";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, formatMoney } from "@/i18n/format";
import type { Catalog, CatalogItem } from "@/lib/catalogs/catalogs";
import { searchCatalogs } from "@/lib/catalogs/search";
import { createItem, loadHold, saveHold } from "@/lib/hold/hold";
import { canonicalUrl, marketplaceNames, type Marketplace } from "@/lib/links/marketplaces";
import { useLocalValue } from "@/lib/local-store";

const AGENT_KEY = "marisship:agent";

export function CatalogSearch({
  locale,
  catalogs,
  t,
  categoryLabels,
  common,
  holdLabels,
  converterHref,
}: {
  locale: Locale;
  catalogs: Catalog[];
  t: Dictionary["catalogs"];
  categoryLabels: Dictionary["categories"];
  common: Dictionary["common"];
  holdLabels: { add: string; added: string };
  converterHref: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [catalogId, setCatalogId] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [marketplace, setMarketplace] = useState<Marketplace | "">("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stowed, setStowed] = useState<Set<string>>(new Set());
  const saved = useLocalValue(AGENT_KEY);
  const preferred = converterAgents.find((a) => a.slug === saved);

  const max = toNumber(maxPrice);
  const hits = useMemo(
    () =>
      searchCatalogs(
        catalogs,
        query,
        {
          catalogId: catalogId || undefined,
          category: category || undefined,
          marketplace: marketplace || undefined,
          maxPriceCny: max > 0 ? max : undefined,
        },
        locale,
        categoryLabels as Record<Category, string>,
      ),
    [catalogs, query, catalogId, category, marketplace, max, locale, categoryLabels],
  );
  const catalogCount = new Set(hits.map((h) => h.catalog.id)).size;
  const usedCategories = [...new Set(catalogs.flatMap((c) => c.items.map((i) => i.category)))];
  const usedMarketplaces = [...new Set(catalogs.flatMap((c) => c.items.map((i) => i.marketplace)))];

  function stow(item: CatalogItem) {
    const { item: entry } = createItem({
      url: canonicalUrl(item),
      title: item.title[locale],
      priceCny: item.priceCny ?? 0,
      qty: 1,
      weightG: 0,
    });
    saveHold([...loadHold(), entry]);
    setStowed((current) => new Set(current).add(`${item.marketplace}:${item.id}`));
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="card p-5 sm:p-6">
        <label htmlFor={`${id}-q`} className="mb-1.5 block text-sm font-semibold">
          {t.search}
        </label>
        <input
          id={`${id}-q`}
          type="search"
          className="field text-lg"
          placeholder={t.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field id={`${id}-catalog`} label={t.catalog}>
            <select id={`${id}-catalog`} className="field" value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
              <option value="">{t.allCatalogs}</option>
              {catalogs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title[locale]}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${id}-category`} label={t.category}>
            <select
              id={`${id}-category`}
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "")}
            >
              <option value="">{t.allCategories}</option>
              {usedCategories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${id}-market`} label={t.marketplace}>
            <select
              id={`${id}-market`}
              className="field"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value as Marketplace | "")}
            >
              <option value="">{t.allMarketplaces}</option>
              {usedMarketplaces.map((m) => (
                <option key={m} value={m}>
                  {marketplaceNames[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${id}-max`} label={t.maxPrice}>
            <input
              id={`${id}-max`}
              className="field"
              inputMode="decimal"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              autoComplete="off"
            />
          </Field>
        </div>
      </div>

      <section aria-label={t.title}>
        <p className="text-sm text-muted" aria-live="polite" data-testid="catalog-count">
          {fill(t.results, { n: hits.length, c: catalogCount })}
        </p>
        {hits.length ? (
          <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {hits.map(({ catalog, item }) => {
              const key = `${item.marketplace}:${item.id}`;
              const agentUrl = preferred ? agentLinks(item).find((l) => l.agent.slug === preferred.slug)?.url : undefined;
              return (
                <li key={`${catalog.id}-${key}`} className="card flex flex-col p-5" data-testid="catalog-hit">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-foam px-2.5 py-1 font-bold">{categoryLabels[item.category]}</span>
                    <span className="text-muted">{catalog.title[locale]}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg leading-snug font-semibold">{item.title[locale]}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {marketplaceNames[item.marketplace]} · <span className="font-mono">#{item.id}</span>
                  </p>
                  {item.priceCny ? (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold tabular-nums">{formatMoney(locale, item.priceCny, "CNY")}</span>{" "}
                      <span className="text-xs text-muted">
                        ({fill(t.price, { date: formatDate(locale, catalog.lastVerified) })})
                      </span>
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <a
                      href={canonicalUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link inline-flex items-center gap-1 font-semibold"
                    >
                      {fill(t.open, { marketplace: marketplaceNames[item.marketplace] })}
                      <ExternalIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">({common.newTab})</span>
                    </a>
                    {preferred && agentUrl ? (
                      <a
                        href={agentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link inline-flex items-center gap-1 font-semibold"
                      >
                        {fill(t.agentLink, { agent: preferred.name })}
                        <ExternalIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">({common.newTab})</span>
                      </a>
                    ) : null}
                    <Link href={`${converterHref}?url=${encodeURIComponent(canonicalUrl(item))}`} className="link">
                      {t.convert}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => stow(item)}
                    disabled={stowed.has(key)}
                    className="mt-4 inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-line bg-surface px-3 text-sm font-semibold hover:border-sea disabled:opacity-70"
                  >
                    {stowed.has(key) ? <CheckIcon className="h-4 w-4 text-sea" /> : <CrateIcon className="h-4 w-4" />}
                    {stowed.has(key) ? holdLabels.added : holdLabels.add}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="card mt-3 border-dashed p-6 text-center text-muted">{t.empty}</p>
        )}
      </section>
    </div>
  );
}
