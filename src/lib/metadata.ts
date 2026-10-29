import type { Metadata } from "next";
import { href, locales, type Locale, type RouteKey } from "@/i18n/config";

/**
 * Page metadata with canonical URL and hreflang alternates. `restByLocale`
 * holds extra path segments that differ per locale (e.g. guide slugs).
 */
export function pageMetadata(
  locale: Locale,
  key: RouteKey,
  title: string,
  description: string,
  restByLocale?: Record<Locale, string[]>,
): Metadata {
  const pathFor = (l: Locale) => href(l, key, ...(restByLocale?.[l] ?? []));
  const languages = Object.fromEntries(locales.map((l) => [l, pathFor(l)]));
  return {
    title,
    description,
    alternates: {
      canonical: pathFor(locale),
      languages: { ...languages, "x-default": pathFor("it") },
    },
    openGraph: { title, description, url: pathFor(locale) },
    twitter: { card: "summary_large_image", title, description },
  };
}
