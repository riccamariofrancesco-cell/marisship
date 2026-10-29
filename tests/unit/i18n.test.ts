import { describe, expect, it } from "vitest";
import { guides } from "@/content/guides";
import { href, negotiateLocale, routeKeyForAnySlug, routeKeyForSlug } from "@/i18n/config";
import en from "@/i18n/messages/en.json";
import it_ from "@/i18n/messages/it.json";
import { switchLocalePath } from "@/i18n/paths";

function shape(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => shape(v, `${prefix}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("dictionaries", () => {
  it("have exactly the same keys in Italian and English", () => {
    expect(shape(it_).sort()).toEqual(shape(en).sort());
  });

  it("have no empty strings", () => {
    const empty = (dict: unknown) => shape(dict).filter((path) => {
      const value = path.split(/\.|\[|\]/).filter(Boolean).reduce<unknown>((acc, k) => (acc as Record<string, unknown>)[k], dict);
      return typeof value === "string" && value.trim() === "";
    });
    expect(empty(en)).toEqual([]);
    expect(empty(it_)).toEqual([]);
  });
});

describe("routes", () => {
  it("builds localized paths", () => {
    expect(href("it", "home")).toBe("/it");
    expect(href("it", "calculator")).toBe("/it/calcolatore-spedizioni");
    expect(href("en", "calculator")).toBe("/en/shipping-calculator");
    expect(href("it", "guides", "come-funziona-uno-shopping-agent")).toBe("/it/guide/come-funziona-uno-shopping-agent");
  });

  it("maps slugs back to routes", () => {
    expect(routeKeyForSlug("it", "stiva")).toBe("hold");
    expect(routeKeyForSlug("it", "hold")).toBeUndefined();
    expect(routeKeyForAnySlug("hold")).toBe("hold");
  });

  it("switches language on the equivalent page", () => {
    expect(switchLocalePath("it", ["shipping-calculator"], "en")).toBe("/en/shipping-calculator");
    expect(switchLocalePath("en", ["hold"], "it")).toBe("/it/stiva");
    expect(switchLocalePath("en", [], "it")).toBe("/it");
    expect(switchLocalePath("it", ["sconosciuta"], "en")).toBe("/en");
    const guide = guides[0];
    expect(switchLocalePath("it", ["guides", guide.slug.it], "en")).toBe(`/en/guides/${guide.slug.en}`);
    expect(switchLocalePath("it", ["guides", "missing"], "en")).toBe("/en/guides");
  });

  it("negotiates the visitor's language", () => {
    expect(negotiateLocale(null)).toBe("it");
    expect(negotiateLocale("it-IT,it;q=0.9,en;q=0.8")).toBe("it");
    expect(negotiateLocale("en-US,en;q=0.9")).toBe("en");
    expect(negotiateLocale("de-DE,de;q=0.9,it;q=0.5")).toBe("it");
    expect(negotiateLocale("de-DE,fr;q=0.8")).toBe("en");
    expect(negotiateLocale("en;q=0,it")).toBe("it");
  });
});

describe("guides", () => {
  it("have unique slugs per locale", () => {
    for (const locale of ["it", "en"] as const) {
      const slugs = guides.map((g) => g.slug[locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
