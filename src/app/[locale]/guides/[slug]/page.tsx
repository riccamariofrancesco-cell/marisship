import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { ArrowRightIcon } from "@/components/icons";
import { guideBySlug, guides } from "@/content/guides";
import { loadGuide } from "@/content/mdx";
import { href, isLocale } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/i18n/format";
import { pageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  const value = await rootLocale();
  const locale = isLocale(value) ? value : "it";
  return guides.map((guide) => ({ slug: guide.slug[locale] }));
}

async function findGuide(params: Promise<{ slug: string }>) {
  const locale = await getLocale();
  const { slug } = await params;
  const guide = guideBySlug(locale, decodeURIComponent(slug));
  if (!guide) notFound();
  return { locale, guide };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { locale, guide } = await findGuide(params);
  const meta = pageMetadata(locale, "guides", guide.title[locale], guide.summary[locale], {
    it: [guide.slug.it],
    en: [guide.slug.en],
  });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: guide.date } };
}

export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, guide } = await findGuide(params);
  const t = dictionaryFor(locale);
  const Body = await loadGuide(guide.id, locale);
  if (!Body) notFound();
  const others = guides.filter((g) => g.id !== guide.id);

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link href={href(locale, "guides")} className="link text-sm font-semibold">
        ← {t.guides.back}
      </Link>
      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {fill(t.common.readTime, { n: guide.minutes })} · {fill(t.common.updated, { date: formatDate(locale, guide.date) })}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {guide.title[locale]}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{guide.summary[locale]}</p>
      </header>
      <div className="prose-sea mt-10">
        <Body />
      </div>
      <aside className="mt-16 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-semibold">{t.home.guidesTitle}</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {others.map((other) => (
            <li key={other.id}>
              <Link
                href={href(locale, "guides", other.slug[locale])}
                className="card group flex h-full items-center justify-between gap-4 p-5 transition hover:border-sea"
              >
                <span className="font-display text-lg font-semibold">{other.title[locale]}</span>
                <ArrowRightIcon className="h-5 w-5 shrink-0 text-link transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
