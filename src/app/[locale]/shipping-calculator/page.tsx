import type { Metadata } from "next";
import { Suspense } from "react";
import { WeightIcon } from "@/components/icons";
import { Calculator, CalculatorFromQuery } from "@/components/tools/Calculator";
import { PageHero } from "@/components/ui/PageHero";
import { agents } from "@/data/agents";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { getCnyRates } from "@/lib/fx";
import { pageMetadata } from "@/lib/metadata";
import { shippingLines } from "@/lib/shipping/lines";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "calculator", t.calculator.title, t.calculator.metaDescription);
}

export default async function CalculatorPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  const fx = await getCnyRates();
  const props = {
    locale,
    t: t.calculator,
    fx,
    lines: shippingLines,
    agentNames: Object.fromEntries(agents.map((a) => [a.slug, a.name])),
  };
  return (
    <>
      <PageHero title={t.calculator.title} intro={t.calculator.intro} icon={<WeightIcon className="h-7 w-7" />} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Suspense fallback={<Calculator {...props} />}>
          <CalculatorFromQuery {...props} />
        </Suspense>
      </div>
    </>
  );
}
