import type { Metadata } from "next";
import Link from "next/link";
import { ExternalIcon, LighthouseIcon } from "@/components/icons";
import { guides } from "@/content/guides";
import { agents } from "@/data/agents";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import { PageHero } from "@/components/ui/PageHero";
import { marketplaceNames } from "@/lib/links/marketplaces";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return pageMetadata(locale, "agents", t.agents.title, t.agents.metaDescription);
}

export default async function AgentsPage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  const guide = guides.find((g) => g.id === "how-shopping-agents-work");
  const sorted = [...agents].sort(
    (a, b) => Number(Boolean(b.buildUrl)) - Number(Boolean(a.buildUrl)) || a.name.localeCompare(b.name),
  );

  return (
    <>
      <PageHero title={t.agents.title} intro={t.agents.intro} icon={<LighthouseIcon className="h-7 w-7" />} />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  {t.agents.colAgent}
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  {t.agents.colConverter}
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  {t.agents.colMarketplaces}
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  {t.agents.colChecked}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((agent) => (
                <tr key={agent.slug} className="border-t border-line">
                  <th scope="row" className="px-5 py-4 text-left">
                    <a
                      href={agent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold hover:text-link"
                    >
                      {agent.name}
                      <ExternalIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">({t.common.newTab})</span>
                    </a>
                  </th>
                  <td className="px-5 py-4">
                    {agent.buildUrl ? (
                      <span className="rounded-full bg-foam px-2.5 py-1 text-xs font-bold">{t.agents.supported}</span>
                    ) : (
                      <span className="text-muted">{t.agents.notYet}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {agent.marketplaces.length ? agent.marketplaces.map((m) => marketplaceNames[m]).join(", ") : "—"}
                  </td>
                  <td className="px-5 py-4 text-muted">{formatDate(locale, agent.lastChecked)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">{t.agents.howTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.agents.howText}</p>
          </section>
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold">{t.agents.chooseTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.agents.chooseText}</p>
            {guide ? (
              <Link href={href(locale, "guides", guide.slug[locale])} className="link mt-3 inline-block font-semibold">
                {t.agents.guideLink}
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
