import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Wave } from "@/components/ui/Wave";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ISSUES_URL, REPO_URL } from "@/lib/site";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const tools = (["calculator", "converter", "hold", "catalogs", "stores", "search"] as const).map((key) => ({
    href: href(locale, key),
    label: t.nav[key],
  }));
  const project = [
    { href: href(locale, "agents"), label: t.nav.agents },
    { href: href(locale, "guides"), label: t.nav.guides },
    { href: href(locale, "contact"), label: t.contact.title },
    { href: href(locale, "privacy"), label: t.legal.privacyTitle },
    { href: href(locale, "terms"), label: t.legal.termsTitle },
  ];
  const heading = "mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted";
  const link = "text-sm hover:text-link hover:underline underline-offset-4";

  return (
    <footer className="mt-24 text-ink">
      <Wave className="block h-10 w-full text-surface-2" />
      <div className="bg-surface-2">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-xl font-semibold">Marisship</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted">{t.footer.tagline}</p>
            <ul className="mt-5 space-y-2">
              <li>
                <a className="link text-sm" href={REPO_URL} rel="noopener">
                  {t.footer.openSource}
                </a>
              </li>
              <li>
                <a className="link text-sm" href={ISSUES_URL} rel="noopener">
                  {t.footer.report}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className={heading}>{t.footer.tools}</h2>
            <ul className="space-y-2">
              {tools.map((item) => (
                <li key={item.href}>
                  <Link className={link} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={heading}>{t.footer.about}</h2>
            <ul className="space-y-2">
              {project.map((item) => (
                <li key={item.href}>
                  <Link className={link} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">
          <p>{t.footer.disclaimer}</p>
          <p className="mt-2">{t.footer.estimates}</p>
        </div>
      </div>
    </footer>
  );
}
