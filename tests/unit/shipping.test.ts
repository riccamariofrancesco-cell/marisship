import { describe, expect, it } from "vitest";
import { chargeableWeightG, estimate, volumetricWeightG, type Pricing } from "@/lib/shipping/calc";
import { linesFileSchema, shippingLines } from "@/lib/shipping/lines";

const step: Pricing = { type: "step", firstWeightG: 500, firstPrice: 120, stepWeightG: 500, stepPrice: 40 };
const perKg: Pricing = { type: "perKg", pricePerKg: 80, minWeightG: 1000, roundingG: 100 };

describe("weights", () => {
  it("computes volumetric weight from cm and divisor", () => {
    expect(volumetricWeightG({ weightG: 1, lengthCm: 40, widthCm: 30, heightCm: 20, divisor: 6000 })).toBe(4000);
    expect(volumetricWeightG({ weightG: 1, lengthCm: 40, widthCm: 30, heightCm: 20, divisor: 8000 })).toBe(3000);
    expect(volumetricWeightG({ weightG: 1, lengthCm: 40, widthCm: 30, divisor: 6000 })).toBeNull();
  });

  it("rounds the step model up to whole steps", () => {
    expect(chargeableWeightG(200, step)).toBe(500);
    expect(chargeableWeightG(500, step)).toBe(500);
    expect(chargeableWeightG(501, step)).toBe(1000);
    expect(chargeableWeightG(1500, step)).toBe(1500);
    expect(chargeableWeightG(1501, step)).toBe(2000);
  });

  it("applies the minimum and rounding of the per-kg model", () => {
    expect(chargeableWeightG(300, perKg)).toBe(1000);
    expect(chargeableWeightG(1234, perKg)).toBe(1300);
    expect(chargeableWeightG(1300, perKg)).toBe(1300);
  });

  it("does not over-round because of floating point noise", () => {
    const tenths: Pricing = { type: "perKg", pricePerKg: 10, minWeightG: 0, roundingG: 0.1 };
    expect(chargeableWeightG(0.3, tenths)).toBeCloseTo(0.3);
  });
});

describe("estimate", () => {
  it("prices the step model", () => {
    const result = estimate({ weightG: 1200, divisor: 6000 }, step);
    expect(result).toMatchObject({ chargeableG: 1500, base: 200, total: 200, volumetricWins: false });
  });

  it("lets volume win when the box is light but big", () => {
    const result = estimate({ weightG: 1000, lengthCm: 40, widthCm: 30, heightCm: 20, divisor: 6000 }, perKg);
    expect(result).toMatchObject({ volumetricG: 4000, chargeableG: 4000, volumetricWins: true, base: 320 });
  });

  it("applies fees in order", () => {
    const result = estimate({ weightG: 1000, divisor: 6000 }, perKg, {
      fuelPct: 10,
      vipPct: 5,
      serviceFee: 8,
      paymentPct: 3,
    });
    // base 80 → +fuel 8 = 88 → −5% = 4.4 → +8 service → 91.6 → +3% = 2.748
    expect(result).toMatchObject({ base: 80, fuel: 8, discount: 4.4, service: 8, payment: 2.75, total: 94.35 });
  });

  it("rejects invalid input", () => {
    expect(estimate({ weightG: 0, divisor: 6000 }, step)).toBeNull();
    expect(estimate({ weightG: 500, divisor: 6000 }, { ...step, stepWeightG: 0 })).toBeNull();
    expect(estimate({ weightG: 500, divisor: 6000 }, step, { fuelPct: 150, vipPct: 0, serviceFee: 0, paymentPct: 0 })).toBeNull();
    expect(estimate({ weightG: Number.NaN, divisor: 6000 }, step)).toBeNull();
  });
});

describe("verified lines file", () => {
  it("is valid and starts empty", () => {
    expect(shippingLines).toEqual([]);
  });

  it("rejects entries without date or source", () => {
    const bad = { lines: [{ agent: "x", name: "y", countries: ["IT"], divisor: 6000, pricing: step, currency: "CNY" }] };
    expect(linesFileSchema.safeParse(bad).success).toBe(false);
  });
});
