"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import type { Locale, RouteKey } from "@/i18n/config";
import { routeKeyForSegment, switchLocalePath } from "@/i18n/paths";
import { ThemeToggle } from "./ThemeToggle";

export interface NavItem {
  key: RouteKey;
  href: string;
  label: string;
  short: string;
}

interface Labels {
  primary: string;
  menu: string;
  closeMenu: string;
  otherLanguage: string;
  otherLanguageLabel: string;
  themeToLight: string;
  themeToDark: string;
}

export function HeaderNav({ locale, items, labels }: { locale: Locale; items: NavItem[]; labels: Labels }) {
  // Segments use the internal folder names, identical on server and client
  // even when the proxy rewrote an Italian slug.
  const segments = useSelectedLayoutSegments();
  const active = routeKeyForSegment(segments[0]);
  const other: Locale = locale === "it" ? "en" : "it";
  const switchHref = switchLocalePath(locale, segments, other);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (key: RouteKey) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
      active === key ? "bg-foam text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <>
      <nav aria-label={labels.primary} className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className={linkClass(item.key)} aria-current={active === item.key ? "page" : undefined}>
                {item.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href={switchHref}
          hrefLang={other}
          lang={other}
          aria-label={labels.otherLanguageLabel}
          className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-3 text-sm font-bold uppercase tracking-wide hover:border-sea"
        >
          {other}
        </Link>
        <ThemeToggle toLight={labels.themeToLight} toDark={labels.themeToDark} />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? labels.closeMenu : labels.menu}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-bg shadow-card lg:hidden"
      >
        <nav aria-label={labels.primary} className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.key ? "page" : undefined}
                  className={`block rounded-xl px-3 py-3 text-base font-semibold ${
                    active === item.key ? "bg-foam text-ink" : "text-ink hover:bg-surface"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
