import type { Metadata } from "next";
import Link from "next/link";
import { CompassIcon } from "@/components/icons";
import { PageHero } from "@/components/ui/PageHero";
import { guides } from "@/content/guides";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/i18n/format";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "guides", t.guides.title, t.guides.metaDescription);
}

export default async function GuidesPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <>
      <PageHero title={t.guides.title} intro={t.guides.intro} icon={<CompassIcon className="h-7 w-7" />} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.id}>
              <Link
                href={href(locale, "guides", guide.slug[locale])}
                className="card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-sea"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {fill(t.common.readTime, { n: guide.minutes })} · {formatDate(locale, guide.date)}
                </span>
                <span className="mt-2 font-display text-2xl font-semibold">{guide.title[locale]}</span>
                <span className="mt-3 text-sm leading-relaxed text-muted">{guide.summary[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
