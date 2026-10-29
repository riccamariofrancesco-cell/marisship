import type { Locale } from "@/i18n/config";

// Guide index. Bodies live in `src/content/guides/<id>.<locale>.mdx`; this file
// only holds what lists, metadata and the language switcher need.

export interface Guide {
  id: string;
  date: string;
  minutes: number;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
}

export const guides: Guide[] = [
  {
    id: "how-shopping-agents-work",
    date: "2026-10-29",
    minutes: 6,
    slug: { it: "come-funziona-uno-shopping-agent", en: "how-shopping-agents-work" },
    title: {
      it: "Come funziona uno shopping agent",
      en: "How a shopping agent works",
    },
    summary: {
      it: "Dal link dell'articolo al pacco a casa: cosa fa l'agent, quando paghi e dove possono nascondersi i costi.",
      en: "From an item link to a parcel at your door: what the agent does, when you pay and where costs can hide.",
    },
  },
  {
    id: "actual-vs-volumetric-weight",
    date: "2026-10-29",
    minutes: 5,
    slug: { it: "peso-reale-e-peso-volumetrico", en: "actual-vs-volumetric-weight" },
    title: {
      it: "Peso reale e peso volumetrico",
      en: "Actual weight vs volumetric weight",
    },
    summary: {
      it: "Perché un pacco leggero ma ingombrante può costare come uno pesante, e come ridurre il volume prima della spedizione.",
      en: "Why a light but bulky parcel can cost as much as a heavy one, and how to cut volume before shipping.",
    },
  },
  {
    id: "choosing-a-shipping-line",
    date: "2026-10-29",
    minutes: 6,
    slug: { it: "come-scegliere-la-linea-di-spedizione", en: "choosing-a-shipping-line" },
    title: {
      it: "Come scegliere la linea di spedizione",
      en: "How to choose a shipping line",
    },
    summary: {
      it: "Prezzo, tempi, limiti di peso e merci accettate: una checklist per confrontare le linee in modo onesto.",
      en: "Price, transit time, weight limits and accepted goods: a checklist for comparing lines fairly.",
    },
  },
];

export function guideBySlug(locale: Locale, slug: string): Guide | undefined {
  return guides.find((g) => g.slug[locale] === slug);
}
