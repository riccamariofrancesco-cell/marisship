import { cacheLife } from "next/cache";
import { z } from "zod";

export interface FxRates {
  date: string;
  EUR: number;
  USD: number;
}

const responseSchema = z.object({
  date: z.iso.date(),
  rates: z.object({ EUR: z.number().positive(), USD: z.number().positive() }),
});

/** ECB reference rates for 1 CNY, refreshed daily. Returns null when unavailable. */
export async function getCnyRates(): Promise<FxRates | null> {
  "use cache";
  cacheLife("days");
  try {
    const response = await fetch("https://api.frankfurter.dev/v1/latest?base=CNY&symbols=EUR,USD", {
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success) return null;
    return { date: parsed.data.date, ...parsed.data.rates };
  } catch {
    return null;
  }
}
