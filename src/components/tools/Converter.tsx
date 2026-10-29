"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, CrateIcon, ExternalIcon } from "@/components/icons";
import { CopyButton } from "@/components/ui/CopyButton";
import { agentLinks, converterAgents } from "@/data/agents";
import type { Dictionary } from "@/i18n/dictionaries";
import { createItem, loadHold, saveHold } from "@/lib/hold/hold";
import { canonicalUrl, marketplaceNames, type Item } from "@/lib/links/marketplaces";
import { parseInput } from "@/lib/links/parse";
import { useLocalValue, writeLocal } from "@/lib/local-store";

const AGENT_KEY = "marisship:agent";
const MAX_LINES = 50;

type Row =
  | { input: string; status: "item"; item: Item }
  | { input: string; status: "resolving" | "failed" | "unknown" };

interface Props {
  t: Dictionary["converter"];
  common: Dictionary["common"];
}

/** Reads `?url=` (e.g. from the Hold); must render inside <Suspense>. */
export function ConverterFromQuery(props: Props) {
  const url = useSearchParams().get("url") ?? "";
  return <Converter key={url} {...props} initialText={url.slice(0, 2048)} />;
}

async function resolveShort(url: string): Promise<Item | null> {
  try {
    const response = await fetch("/api/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await response.json()) as { ok: boolean; item?: Item };
    return data.ok && data.item ? data.item : null;
  } catch {
    return null;
  }
}

export function Converter({ t, common, initialText = "" }: Props & { initialText?: string }) {
  const id = useId();
  const [text, setText] = useState(initialText);
  const [rows, setRows] = useState<Row[]>(() => (initialText ? convert(initialText) : []));
  const saved = useLocalValue(AGENT_KEY);
  const preferred = saved && converterAgents.some((a) => a.slug === saved) ? saved : "";
  const [stowed, setStowed] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  // Each conversion bumps the generation so late answers from an older
  // conversion are ignored.
  const generation = useRef(0);

  function resolvePending(next: Row[], gen: number) {
    next.forEach((row, index) => {
      if (row.status !== "resolving") return;
      const parsed = parseInput(row.input);
      if (parsed.kind !== "short") return;
      resolveShort(parsed.url).then((item) => {
        if (generation.current !== gen) return;
        setRows((current) =>
          current.map((r, i) =>
            i === index ? (item ? { input: r.input, status: "item", item } : { input: r.input, status: "failed" }) : r,
          ),
        );
      });
    });
  }

  useEffect(() => {
    // Rows prefilled from the URL may contain short links to expand.
    resolvePending(rows, generation.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the initial rows
  }, []);

  function convert(value: string): Row[] {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, MAX_LINES)
      .map((input): Row => {
        const parsed = parseInput(input);
        if (parsed.kind === "item") return { input, status: "item", item: parsed.item };
        if (parsed.kind === "short") return { input, status: "resolving" };
        return { input, status: "unknown" };
      });
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = convert(text);
    generation.current += 1;
    setError(next.length ? "" : t.empty);
    setRows(next);
    resolvePending(next, generation.current);
  }

  function choose(slug: string) {
    writeLocal(AGENT_KEY, slug || null);
  }

  function stow(item: Item) {
    const { item: entry } = createItem({ url: canonicalUrl(item), title: "", priceCny: 0, qty: 1, weightG: 0 });
    saveHold([...loadHold(), entry]);
    setStowed((current) => new Set(current).add(`${item.marketplace}:${item.id}`));
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <form onSubmit={onSubmit} className="card p-5 sm:p-6" noValidate>
        <label htmlFor={`${id}-links`} className="mb-1.5 block text-sm font-semibold">
          {t.input}
        </label>
        <textarea
          id={`${id}-links`}
          className="field font-mono text-sm"
          placeholder={t.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          aria-describedby={`${id}-help`}
          aria-invalid={error ? true : undefined}
        />
        <p id={`${id}-help`} className="mt-2 text-xs leading-relaxed text-muted">
          {t.help}
        </p>
        {error ? (
          <p role="alert" className="mt-2 text-sm font-semibold text-accent-text">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <button type="submit" className="btn btn-primary">
            {t.convert}
          </button>
          <div className="min-w-[14rem]">
            <label htmlFor={`${id}-agent`} className="mb-1.5 block text-sm font-semibold">
              {t.preferred}
            </label>
            <select id={`${id}-agent`} className="field" value={preferred} onChange={(e) => choose(e.target.value)}>
              <option value="">{t.preferredAll}</option>
              {converterAgents.map((agent) => (
                <option key={agent.slug} value={agent.slug}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">{t.privacy}</p>
      </form>

      {rows.length ? (
        <section aria-labelledby={`${id}-results`}>
          <h2 id={`${id}-results`} className="font-display text-2xl font-semibold">
            {t.results}
          </h2>
          <ol className="mt-4 grid grid-cols-1 gap-4" aria-live="polite">
            {rows.map((row, index) => (
              <li key={`${index}-${row.input}`} className="card p-5" data-testid="converter-result">
                <p className="truncate font-mono text-xs text-muted" title={row.input}>
                  {row.input}
                </p>
                {row.status === "item" ? (
                  <ItemResult
                    item={row.item}
                    preferred={preferred}
                    t={t}
                    common={common}
                    stowed={stowed.has(`${row.item.marketplace}:${row.item.id}`)}
                    onStow={() => stow(row.item)}
                  />
                ) : (
                  <p className={`mt-2 text-sm ${row.status === "resolving" ? "text-muted" : "font-semibold text-accent-text"}`}>
                    {row.status === "resolving" ? t.resolving : row.status === "failed" ? t.resolveFailed : t.unsupported}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function ItemResult({
  item,
  preferred,
  t,
  common,
  stowed,
  onStow,
}: {
  item: Item;
  preferred: string;
  t: Dictionary["converter"];
  common: Dictionary["common"];
  stowed: boolean;
  onStow: () => void;
}) {
  const marketplaceUrl = canonicalUrl(item);
  const links = agentLinks(item).sort((a, b) => Number(b.agent.slug === preferred) - Number(a.agent.slug === preferred));
  const shown = preferred ? links.filter((l) => l.agent.slug === preferred) : links;
  const others = preferred ? links.filter((l) => l.agent.slug !== preferred) : [];

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-foam px-3 py-1 text-xs font-bold">{marketplaceNames[item.marketplace]}</span>
        <span className="font-mono text-sm">#{item.id}</span>
        <button
          type="button"
          onClick={onStow}
          disabled={stowed}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm font-semibold hover:border-sea disabled:opacity-70"
        >
          {stowed ? <CheckIcon className="h-4 w-4 text-sea" /> : <CrateIcon className="h-4 w-4" />}
          {stowed ? t.added : t.addToHold}
        </button>
      </div>

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">{t.marketplaceLink}</h3>
      <LinkLine url={marketplaceUrl} label={marketplaceNames[item.marketplace]} common={common} />

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">{t.agentLinks}</h3>
      <ul className="mt-1 grid grid-cols-1 gap-1">
        {shown.map(({ agent, url }) => (
          <li key={agent.slug}>
            <LinkLine url={url} label={agent.name} common={common} />
          </li>
        ))}
      </ul>
      {others.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-semibold text-link">{t.preferredAll}</summary>
          <ul className="mt-1 grid grid-cols-1 gap-1">
            {others.map(({ agent, url }) => (
              <li key={agent.slug}>
                <LinkLine url={url} label={agent.name} common={common} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function LinkLine({ url, label, common }: { url: string; label: string; common: Dictionary["common"] }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 font-semibold hover:text-link"
      >
        <span className="w-24 shrink-0">{label}</span>
        <span className="truncate font-mono text-xs font-normal text-muted">{url}</span>
        <ExternalIcon className="h-4 w-4 shrink-0" />
        <span className="sr-only">({common.newTab})</span>
      </a>
      <CopyButton text={url} label={common.copy} doneLabel={common.copied} />
    </div>
  );
}
