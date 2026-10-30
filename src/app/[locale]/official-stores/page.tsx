import type { Metadata } from "next";
import { StoreIcon } from "@/components/icons";
import { StoreDirectory } from "@/components/tools/StoreDirectory";
import { PageHero } from "@/components/ui/PageHero";
import { stores } from "@/data/stores";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/i18n/format";
import { pageMetadata } from "@/lib/metadata";
import { ISSUES_URL } from "@/lib/site";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "stores", t.stores.title, t.stores.metaDescription);
}

export default async function OfficialStoresPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  const lastChecked = stores.map((s) => s.lastChecked).sort().at(-1) ?? "";
  return (
    <>
      <PageHero title={t.stores.title} intro={t.stores.intro} icon={<StoreIcon className="h-7 w-7" />} />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6">
        <StoreDirectory stores={stores} t={t.stores} categoryLabels={t.categories} common={t.common} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">{t.stores.howTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.stores.howText}</p>
            <Link href={href(locale, "converter")} className="link mt-3 inline-block font-semibold">
              {t.nav.converter}
            </Link>
          </section>
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">{t.stores.checkedTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {fill(t.stores.checkedText, { date: formatDate(locale, lastChecked) })}
            </p>
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block font-semibold">
              {t.stores.suggest}
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
