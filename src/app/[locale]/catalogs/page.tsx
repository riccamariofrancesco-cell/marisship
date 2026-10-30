import type { Metadata } from "next";
import { LedgerIcon } from "@/components/icons";
import { CatalogSearch } from "@/components/tools/CatalogSearch";
import { PageHero } from "@/components/ui/PageHero";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/i18n/format";
import { catalogs } from "@/lib/catalogs/catalogs";
import { pageMetadata } from "@/lib/metadata";
import { REPO_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "catalogs", t.catalogs.title, t.catalogs.metaDescription);
}

export default async function CatalogsPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <>
      <PageHero title={t.catalogs.title} intro={t.catalogs.intro} icon={<LedgerIcon className="h-7 w-7" />} />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6">
        <CatalogSearch
          locale={locale}
          catalogs={catalogs}
          t={t.catalogs}
          categoryLabels={t.categories}
          common={t.common}
          holdLabels={{ add: t.converter.addToHold, added: t.converter.added }}
          converterHref={href(locale, "converter")}
        />

        <section aria-labelledby="catalog-list">
          <h2 id="catalog-list" className="font-display text-2xl font-semibold">
            {t.catalogs.listTitle}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {catalogs.map((catalog) => (
              <li key={catalog.id} className="card p-5">
                <h3 className="font-display text-lg font-semibold">{catalog.title[locale]}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{catalog.description[locale]}</p>
                <p className="mt-3 text-xs text-muted">
                  {fill(t.catalogs.items, { n: catalog.items.length })} ·{" "}
                  {fill(t.catalogs.curator, { name: catalog.curator })} ·{" "}
                  {fill(t.catalogs.verified, { date: formatDate(locale, catalog.lastVerified) })}
                  {catalog.source ? (
                    <>
                      {" · "}
                      <a href={catalog.source} target="_blank" rel="noopener noreferrer" className="link">
                        {t.catalogs.source}
                      </a>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
            <li className="rounded-[1.25rem] border border-dashed border-line p-5">
              <h3 className="font-display text-lg font-semibold">{t.catalogs.contributeTitle}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t.catalogs.contributeText}</p>
              <a
                href={`${REPO_URL}#aggiungere-un-catalogo`}
                target="_blank"
                rel="noopener noreferrer"
                className="link mt-3 inline-block text-sm font-semibold"
              >
                {t.catalogs.contribute}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
