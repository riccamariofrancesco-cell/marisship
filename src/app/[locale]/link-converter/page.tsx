import type { Metadata } from "next";
import { Suspense } from "react";
import { LinkIcon } from "@/components/icons";
import { Converter, ConverterFromQuery } from "@/components/tools/Converter";
import { PageHero } from "@/components/ui/PageHero";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "converter", t.converter.title, t.converter.metaDescription);
}

export default async function ConverterPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  const props = { t: t.converter, common: t.common };
  return (
    <>
      <PageHero title={t.converter.title} intro={t.converter.intro} icon={<LinkIcon className="h-7 w-7" />} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Suspense fallback={<Converter {...props} />}>
          <ConverterFromQuery {...props} />
        </Suspense>
      </div>
    </>
  );
}
