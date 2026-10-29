import type { Locale } from "./config";

/** Replaces `{name}` placeholders in a message. */
export function fill(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const intlLocale: Record<Locale, string> = { it: "it-IT", en: "en-GB" };

export function formatDate(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

export function formatNumber(locale: Locale, value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits }).format(value);
}

export function formatMoney(locale: Locale, value: number, currency: string): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency }).format(value);
}

/** Grams shown as kg above one kilo, e.g. 1250 → "1,25 kg". */
export function formatWeight(locale: Locale, grams: number): string {
  if (grams >= 1000) return `${formatNumber(locale, grams / 1000, 2)} kg`;
  return `${formatNumber(locale, grams, 0)} g`;
}
