"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, ExternalIcon, LinkIcon, TrashIcon } from "@/components/icons";
import { Field, toNumber } from "@/components/ui/Field";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMoney, formatWeight } from "@/i18n/format";
import {
  STORAGE_KEY,
  createItem,
  itemsFromStorage,
  parseHoldFile,
  saveHold,
  serializeHold,
  totals,
  type HoldItem,
} from "@/lib/hold/hold";
import { marketplaceNames } from "@/lib/links/marketplaces";
import { useLocalValue, useStorageAvailable } from "@/lib/local-store";

const emptyForm = { url: "", title: "", price: "", qty: "1", weight: "" };

export function Hold({
  locale,
  t,
  common,
  calculatorHref,
  converterHref,
}: {
  locale: Locale;
  t: Dictionary["hold"];
  common: Dictionary["common"];
  calculatorHref: string;
  converterHref: string;
}) {
  const id = useId();
  const raw = useLocalValue(STORAGE_KEY);
  const items = useMemo(() => itemsFromStorage(raw), [raw]);
  const available = useStorageAvailable();
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const sum = totals(items);
  const cny = (value: number) => formatMoney(locale, value, "CNY");

  function update(next: HoldItem[]) {
    saveHold(next);
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!form.url.trim() && !form.title.trim()) return;
    const { item, recognised } = createItem({
      url: form.url,
      title: form.title,
      priceCny: toNumber(form.price),
      qty: toNumber(form.qty),
      weightG: toNumber(form.weight),
    });
    update([...items, item]);
    setForm(emptyForm);
    setNotice(recognised || !form.url.trim() ? "" : t.unrecognised);
  }

  function setQty(itemId: string, value: string) {
    const qty = Math.min(999, Math.max(1, Math.round(toNumber(value) || 1)));
    update(items.map((item) => (item.id === itemId ? { ...item, qty } : item)));
  }

  function exportFile() {
    const blob = new Blob([serializeHold(items)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = locale === "it" ? "marisship-stiva.json" : "marisship-hold.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const imported = file.size < 1_000_000 ? parseHoldFile(await file.text()) : null;
    if (!imported) {
      setNotice(t.importError);
      return;
    }
    const known = new Set(items.map((item) => item.id));
    update([...items, ...imported.filter((item) => !known.has(item.id))]);
    setNotice("");
  }

  function clearAll() {
    if (window.confirm(t.confirmClear)) update([]);
  }

  const field = (name: keyof typeof emptyForm) => ({
    id: `${id}-${name}`,
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [name]: e.target.value })),
    className: "field",
    autoComplete: "off",
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="space-y-6">
        {!available ? (
          <p role="status" className="card border-l-4 border-l-accent p-4 text-sm">
            {t.storageWarning}
          </p>
        ) : null}

        <form onSubmit={add} className="card p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">{t.add}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id={`${id}-url`} label={t.link}>
                <input {...field("url")} inputMode="url" placeholder="https://…" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id={`${id}-title`} label={t.name}>
                <input {...field("title")} maxLength={200} />
              </Field>
            </div>
            <Field id={`${id}-price`} label={t.price}>
              <input {...field("price")} inputMode="decimal" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id={`${id}-qty`} label={t.qty}>
                <input {...field("qty")} inputMode="numeric" />
              </Field>
              <Field id={`${id}-weight`} label={t.weight}>
                <input {...field("weight")} inputMode="decimal" />
              </Field>
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-5">
            {t.addButton}
          </button>
          {notice ? (
            <p role="status" className="mt-3 text-sm font-semibold text-accent-text">
              {notice}
            </p>
          ) : null}
        </form>
      </div>

      <aside className="lg:sticky lg:top-24" aria-labelledby={`${id}-summary`}>
        <div className="card overflow-hidden">
          <div className="bg-band px-5 py-4 text-on-band sm:px-6">
            <h2 id={`${id}-summary`} className="font-display text-xl font-semibold">
              {t.title}
            </h2>
          </div>
          <dl className="grid grid-cols-3 gap-2 p-5 sm:p-6" aria-live="polite">
            <div>
              <dt className="text-xs text-muted">{t.items}</dt>
              <dd className="font-display text-2xl font-semibold" data-testid="hold-count">
                {sum.count}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t.totalPrice}</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">{cny(sum.priceCny)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t.totalWeight}</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums" data-testid="hold-weight">
                {formatWeight(locale, sum.weightG)}
              </dd>
            </div>
          </dl>
          <div className="space-y-3 border-t border-line p-5 sm:p-6">
            {sum.weightG > 0 ? (
              <Link href={`${calculatorHref}?w=${Math.round(sum.weightG)}`} className="btn btn-primary w-full">
                {t.estimate}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost" onClick={exportFile} disabled={!items.length}>
                {t.export}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => fileInput.current?.click()}>
                {t.import}
              </button>
              <input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={importFile} aria-hidden="true" />
              <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={!items.length}>
                {t.clearAll}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-muted">{t.tip}</p>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-2" aria-label={t.items}>
        {items.length ? (
          <ul className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <li key={item.id} className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4" data-testid="hold-item">
                <div className="min-w-0 flex-1 basis-60">
                  <p className="font-semibold">{item.title || t.untitled}</p>
                  {item.url ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      {item.marketplace ? (
                        <span className="rounded-full bg-foam px-2 py-0.5 text-xs font-bold">
                          {marketplaceNames[item.marketplace]}
                        </span>
                      ) : null}
                      {/^https?:\/\//.test(item.url) ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                          {item.itemId ? `#${item.itemId}` : common.open}
                          <ExternalIcon className="h-3.5 w-3.5" />
                          <span className="sr-only">({common.newTab})</span>
                        </a>
                      ) : (
                        <span className="truncate text-muted">{item.url}</span>
                      )}
                      {item.marketplace ? (
                        <Link
                          href={`${converterHref}?url=${encodeURIComponent(item.url)}`}
                          className="link inline-flex items-center gap-1"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          {t.convertLink}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted">{t.colPrice}</dt>
                    <dd className="tabular-nums">{cny(item.priceCny)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      <label htmlFor={`${id}-q-${item.id}`}>{t.colQty}</label>
                    </dt>
                    <dd>
                      <input
                        id={`${id}-q-${item.id}`}
                        className="field h-9 min-h-0 w-16 px-2 py-1"
                        inputMode="numeric"
                        key={item.qty}
                        defaultValue={item.qty}
                        onBlur={(e) => setQty(item.id, e.target.value)}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{t.colWeight}</dt>
                    <dd className="tabular-nums">{formatWeight(locale, item.weightG * item.qty)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{t.colSubtotal}</dt>
                    <dd className="font-semibold tabular-nums">{cny(item.priceCny * item.qty)}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => update(items.filter((i) => i.id !== item.id))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-accent"
                  aria-label={`${common.remove}: ${item.title || t.untitled}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card border-dashed p-6 text-center text-muted">{t.empty}</p>
        )}
      </section>
    </div>
  );
}
