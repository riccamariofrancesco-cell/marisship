import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { href, type Locale, type RouteKey } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { HeaderNav, type NavItem } from "./HeaderNav";

const navKeys = ["calculator", "converter", "hold", "search", "agents", "guides"] as const satisfies RouteKey[];

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const items: NavItem[] = navKeys.map((key) => ({
    key,
    href: href(locale, key),
    label: t.nav[key],
    short: t.nav.short[key],
  }));
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href={href(locale, "home")} className="shrink-0 rounded-lg" aria-label={`Marisship · ${t.nav.home}`}>
          <Logo />
        </Link>
        <HeaderNav
          locale={locale}
          items={items}
          labels={{
            primary: t.nav.primary,
            menu: t.nav.menu,
            closeMenu: t.nav.closeMenu,
            otherLanguage: t.nav.otherLanguage,
            otherLanguageLabel: t.nav.otherLanguageLabel,
            themeToLight: t.nav.themeToLight,
            themeToDark: t.nav.themeToDark,
          }}
        />
      </div>
    </header>
  );
}
