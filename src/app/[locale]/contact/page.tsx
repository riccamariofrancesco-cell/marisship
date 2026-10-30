import type { Metadata } from "next";
import { ExternalIcon } from "@/components/icons";
import { PageHero } from "@/components/ui/PageHero";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";
import { ISSUES_URL, REPO_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "contact", t.contact.title, t.contact.metaDescription);
}

export default async function ContactPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <>
      <PageHero title={t.contact.title} intro={t.contact.intro} />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">{t.contact.issues}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.contact.issuesText}</p>
          <p className="mt-3 rounded-xl bg-foam p-3 text-sm">{t.contact.warning}</p>
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">
            {t.contact.issues}
            <ExternalIcon className="h-4 w-4" />
            <span className="sr-only">({t.common.newTab})</span>
          </a>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">{t.contact.code}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.contact.codeText}</p>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-5">
            GitHub
            <ExternalIcon className="h-4 w-4" />
            <span className="sr-only">({t.common.newTab})</span>
          </a>
        </section>
      </div>
    </>
  );
}
