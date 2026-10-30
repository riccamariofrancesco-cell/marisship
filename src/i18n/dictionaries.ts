import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import en from "./messages/en.json";
import it from "./messages/it.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, it };

/** Current locale from the `[locale]` root segment; unknown values 404. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}
