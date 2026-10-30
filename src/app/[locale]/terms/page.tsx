import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "terms", t.legal.termsTitle, t.legal.termsDescription);
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return <LegalPage locale={locale} page="terms" title={t.legal.termsTitle} intro={t.legal.termsDescription} />;
}
