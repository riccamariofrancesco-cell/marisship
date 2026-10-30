// Locale and route configuration shared by the proxy, server and client code.
// Folder names under `app/[locale]` use the English slug; Italian slugs are
// rewritten to them by `src/proxy.ts`.

export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "it" || value === "en";
}

export const routes = {
  home: { en: "", it: "" },
  calculator: { en: "shipping-calculator", it: "calcolatore-spedizioni" },
  converter: { en: "link-converter", it: "convertitore-link" },
  hold: { en: "hold", it: "stiva" },
  agents: { en: "agents", it: "agent" },
  search: { en: "search", it: "ricerca" },
  guides: { en: "guides", it: "guide" },
  privacy: { en: "privacy", it: "privacy" },
  terms: { en: "terms", it: "termini" },
  contact: { en: "contact", it: "contatti" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

const routeKeys = Object.keys(routes) as RouteKey[];

/** Public, localized path for a route, e.g. `href("it", "calculator")` → `/it/calcolatore-spedizioni`. */
export function href(locale: Locale, key: RouteKey, ...rest: string[]): string {
  const parts = [locale, routes[key][locale], ...rest.map(encodeURIComponent)].filter(Boolean);
  return `/${parts.join("/")}`;
}

/** Finds the route whose slug matches `segment` in the given locale. */
export function routeKeyForSlug(locale: Locale, segment: string): RouteKey | undefined {
  return routeKeys.find((key) => routes[key][locale] !== "" && routes[key][locale] === segment);
}

/** Finds a route whose slug matches `segment` in any locale (used to fix wrong-locale slugs). */
export function routeKeyForAnySlug(segment: string): RouteKey | undefined {
  return routeKeys.find((key) => key !== "home" && locales.some((l) => routes[key][l] === segment));
}

/**
 * Picks a locale from an Accept-Language header. Requests without the header
 * (crawlers, scripts) get the default locale; browsers that prefer neither
 * Italian nor English get English, which is the more widely understood option.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { lang: tag.toLowerCase().split("-")[0], quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter((entry) => entry.lang && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  const match = ranked.find((entry) => isLocale(entry.lang));
  return match ? (match.lang as Locale) : "en";
}
