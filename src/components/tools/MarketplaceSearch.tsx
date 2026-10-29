"use client";

import { useId, useState } from "react";
import { ExternalIcon } from "@/components/icons";
import { glossary, searchTargets } from "@/data/search";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function MarketplaceSearch({
  locale,
  t,
  common,
}: {
  locale: Locale;
  t: Dictionary["search"];
  common: Dictionary["common"];
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const q = query.trim();

  function addTerm(term: string) {
    setQuery((current) => (current.trim() ? `${current.trim()} ${term}` : term));
    document.getElementById(`${id}-q`)?.focus();
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="card p-5 sm:p-6">
        <label htmlFor={`${id}-q`} className="mb-1.5 block text-sm font-semibold">
          {t.query}
        </label>
        <input
          id={`${id}-q`}
          type="search"
          className="field text-lg"
          placeholder={t.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          lang="zh"
          autoComplete="off"
        />
        <p className="mt-4 text-sm font-semibold">{t.on}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {searchTargets.map((target) =>
            q ? (
              <a
                key={target.id}
                href={target.url(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {target.name}
                <ExternalIcon className="h-4 w-4" />
                <span className="sr-only">({common.newTab})</span>
              </a>
            ) : (
              <button key={target.id} type="button" className="btn btn-secondary" disabled>
                {target.name}
              </button>
            ),
          )}
        </div>
        <ul className="mt-4 space-y-1 text-xs leading-relaxed text-muted">
          <li>{t.note1688}</li>
          <li>{t.noteWeidian}</li>
        </ul>
      </div>

      <section aria-labelledby={`${id}-glossary`}>
        <h2 id={`${id}-glossary`} className="font-display text-2xl font-semibold">
          {t.glossaryTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.glossaryIntro}</p>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.colTerm}</th>
                <th className="px-4 py-3 font-semibold">{t.colPinyin}</th>
                <th className="px-4 py-3 font-semibold">{t.colMeaning}</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((term) => (
                <tr key={term.zh} className="border-t border-line">
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => addTerm(term.zh)}
                      lang="zh"
                      className="rounded-lg px-2 py-1 text-lg font-semibold hover:bg-foam"
                    >
                      {term.zh}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-muted" lang="zh-Latn">
                    {term.pinyin}
                  </td>
                  <td className="px-4 py-2">{term.meaning[locale]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
