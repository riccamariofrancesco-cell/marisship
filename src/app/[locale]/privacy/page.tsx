import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "privacy", t.legal.privacyTitle, t.legal.privacyDescription);
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return <LegalPage locale={locale} page="privacy" title={t.legal.privacyTitle} intro={t.legal.privacyDescription} />;
}
