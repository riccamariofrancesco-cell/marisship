import type { Metadata } from "next";
import { SpyglassIcon } from "@/components/icons";
import { MarketplaceSearch } from "@/components/tools/MarketplaceSearch";
import { PageHero } from "@/components/ui/PageHero";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "search", t.search.title, t.search.metaDescription);
}

export default async function SearchPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <>
      <PageHero title={t.search.title} intro={t.search.intro} icon={<SpyglassIcon className="h-7 w-7" />} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <MarketplaceSearch locale={locale} t={t.search} common={t.common} />
      </div>
    </>
  );
}
