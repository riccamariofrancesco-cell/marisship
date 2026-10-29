import type { MDXContent } from "mdx/types";
import type { Locale } from "@/i18n/config";

// Static import maps so the bundler knows every MDX file at build time.

type Loader = () => Promise<{ default: MDXContent }>;

const guideBodies: Record<string, Record<Locale, Loader>> = {
  "how-shopping-agents-work": {
    it: () => import("./guides/how-shopping-agents-work.it.mdx"),
    en: () => import("./guides/how-shopping-agents-work.en.mdx"),
  },
  "actual-vs-volumetric-weight": {
    it: () => import("./guides/actual-vs-volumetric-weight.it.mdx"),
    en: () => import("./guides/actual-vs-volumetric-weight.en.mdx"),
  },
  "choosing-a-shipping-line": {
    it: () => import("./guides/choosing-a-shipping-line.it.mdx"),
    en: () => import("./guides/choosing-a-shipping-line.en.mdx"),
  },
};

const legalBodies: Record<"privacy" | "terms", Record<Locale, Loader>> = {
  privacy: {
    it: () => import("./legal/privacy.it.mdx"),
    en: () => import("./legal/privacy.en.mdx"),
  },
  terms: {
    it: () => import("./legal/terms.it.mdx"),
    en: () => import("./legal/terms.en.mdx"),
  },
};

export async function loadGuide(id: string, locale: Locale): Promise<MDXContent | null> {
  const loader = guideBodies[id]?.[locale];
  return loader ? (await loader()).default : null;
}

export async function loadLegal(page: "privacy" | "terms", locale: Locale): Promise<MDXContent> {
  return (await legalBodies[page][locale]()).default;
}
