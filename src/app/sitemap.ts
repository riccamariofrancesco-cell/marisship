import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { href, locales, routes, type Locale, type RouteKey } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const entry = (pathFor: (locale: Locale) => string, lastModified?: string): MetadataRoute.Sitemap =>
    locales.map((locale) => ({
      url: `${base}${pathFor(locale)}`,
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${base}${pathFor(l)}`])) },
    }));

  const pages = (Object.keys(routes) as RouteKey[]).flatMap((key) => entry((locale) => href(locale, key)));
  const guidePages = guides.flatMap((guide) =>
    entry((locale) => href(locale, "guides", guide.slug[locale]), guide.date),
  );
  return [...pages, ...guidePages];
}
