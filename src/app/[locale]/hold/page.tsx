import type { Metadata } from "next";
import { CrateIcon } from "@/components/icons";
import { Hold } from "@/components/tools/Hold";
import { PageHero } from "@/components/ui/PageHero";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "hold", t.hold.title, t.hold.metaDescription);
}

export default async function HoldPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <>
      <PageHero title={t.hold.title} intro={t.hold.intro} icon={<CrateIcon className="h-7 w-7" />} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hold
          locale={locale}
          t={t.hold}
          common={t.common}
          calculatorHref={href(locale, "calculator")}
          converterHref={href(locale, "converter")}
        />
      </div>
    </>
  );
}
