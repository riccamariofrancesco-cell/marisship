"use client";

import { useId, useState } from "react";
import { ExternalIcon } from "@/components/icons";
import type { Category } from "@/data/categories";
import type { Store } from "@/data/stores";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { normalize } from "@/lib/catalogs/search";

export function StoreDirectory({
  stores,
  t,
  categoryLabels,
  common,
}: {
  stores: Store[];
  t: Dictionary["stores"];
  categoryLabels: Dictionary["categories"];
  common: Dictionary["common"];
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const present = [...new Set(stores.map((s) => s.category))];
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const shown = stores.filter((store) => {
    if (category && store.category !== category) return false;
    const haystack = normalize(`${store.brand} ${store.shopName} ${categoryLabels[store.category]} ${store.slug}`);
    return words.every((word) => haystack.includes(word));
  });

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
      active ? "border-ocean bg-ocean text-on-ocean" : "border-line bg-surface hover:border-sea"
    }`;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="card p-5 sm:p-6">
        <label htmlFor={`${id}-q`} className="mb-1.5 block text-sm font-semibold">
          {t.search}
        </label>
        <input
          id={`${id}-q`}
          type="search"
          className="field"
          placeholder={t.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t.categoryFilter}>
          <button type="button" className={chip(category === "")} aria-pressed={category === ""} onClick={() => setCategory("")}>
            {t.all}
          </button>
          {present.map((c) => (
            <button key={c} type="button" className={chip(category === c)} aria-pressed={category === c} onClick={() => setCategory(c)}>
              {categoryLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted" aria-live="polite" data-testid="stores-count">
        {fill(t.count, { n: shown.length })}
      </p>

      {shown.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((store) => (
            <li key={store.slug} className="card flex flex-col p-5" data-testid="store-card">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">{categoryLabels[store.category]}</span>
              <h2 className="mt-1 font-display text-xl font-semibold">{store.brand}</h2>
              <p className="mt-1 text-sm text-muted" lang="zh">
                {store.shopName}
              </p>
              {store.note ? <p className="mt-2 text-xs text-accent-text">{t.notes[store.note]}</p> : null}
              <a
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
              >
                {t.open}
                <ExternalIcon className="h-4 w-4" />
                <span className="sr-only">({common.newTab})</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card border-dashed p-6 text-center text-muted">{t.empty}</p>
      )}
    </div>
  );
}
