import { z } from "zod";
import data from "@/data/shipping-lines.json";

// Verified shipping rates used by the "compare lines" table. The file starts
// empty on purpose: rates are only added with a date and a public source.
// Validation runs at build time, so a malformed entry fails the build.

const pricingSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("step"),
    firstWeightG: z.number().positive(),
    firstPrice: z.number().nonnegative(),
    stepWeightG: z.number().positive(),
    stepPrice: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal("perKg"),
    pricePerKg: z.number().positive(),
    minWeightG: z.number().nonnegative(),
    roundingG: z.number().nonnegative(),
  }),
]);

export const lineSchema = z.object({
  agent: z.string().min(1),
  name: z.string().min(1),
  countries: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1),
  divisor: z.number().positive(),
  pricing: pricingSchema,
  currency: z.literal("CNY"),
  maxWeightG: z.number().positive().optional(),
  days: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]).optional(),
  lastVerified: z.iso.date(),
  source: z.url(),
});

export const linesFileSchema = z.object({ lines: z.array(lineSchema) });

export type ShippingLine = z.infer<typeof lineSchema>;

export const shippingLines: ShippingLine[] = linesFileSchema.parse(data).lines;
