// Shipping estimate maths. All prices are in the line's currency (CNY), all
// weights in grams, all dimensions in centimetres.

export type Pricing =
  | { type: "step"; firstWeightG: number; firstPrice: number; stepWeightG: number; stepPrice: number }
  | { type: "perKg"; pricePerKg: number; minWeightG: number; roundingG: number };

export interface Parcel {
  weightG: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  /** cm³ per kg, e.g. 6000. */
  divisor: number;
}

export interface Fees {
  fuelPct: number;
  serviceFee: number;
  paymentPct: number;
  vipPct: number;
}

export interface Estimate {
  volumetricG: number | null;
  chargeableG: number;
  volumetricWins: boolean;
  base: number;
  fuel: number;
  discount: number;
  service: number;
  payment: number;
  total: number;
}

export const noFees: Fees = { fuelPct: 0, serviceFee: 0, paymentPct: 0, vipPct: 0 };

// Guards Math.ceil against floating point noise such as 2.0000000000000004.
const EPSILON = 1e-9;
const ceil = (value: number) => Math.ceil(value - EPSILON);
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const finite = (value: number) => Number.isFinite(value);
const nonNegative = (value: number) => finite(value) && value >= 0;
const positive = (value: number) => finite(value) && value > 0;
const percentage = (value: number) => nonNegative(value) && value <= 100;

export function volumetricWeightG(parcel: Parcel): number | null {
  const { lengthCm, widthCm, heightCm, divisor } = parcel;
  if (!lengthCm || !widthCm || !heightCm || !positive(divisor)) return null;
  if (![lengthCm, widthCm, heightCm].every(positive)) return null;
  return Math.round(((lengthCm * widthCm * heightCm) / divisor) * 1000);
}

export function chargeableWeightG(weightG: number, pricing: Pricing): number {
  if (pricing.type === "step") {
    if (weightG <= pricing.firstWeightG) return pricing.firstWeightG;
    const steps = ceil((weightG - pricing.firstWeightG) / pricing.stepWeightG);
    return pricing.firstWeightG + steps * pricing.stepWeightG;
  }
  const weight = Math.max(weightG, pricing.minWeightG);
  return pricing.roundingG > 0 ? ceil(weight / pricing.roundingG) * pricing.roundingG : weight;
}

export function baseCost(chargeableG: number, pricing: Pricing): number {
  if (pricing.type === "step") {
    const steps = Math.max(0, Math.round((chargeableG - pricing.firstWeightG) / pricing.stepWeightG));
    return pricing.firstPrice + steps * pricing.stepPrice;
  }
  return (chargeableG / 1000) * pricing.pricePerKg;
}

export function isValidPricing(pricing: Pricing): boolean {
  if (pricing.type === "step") {
    return (
      positive(pricing.firstWeightG) &&
      nonNegative(pricing.firstPrice) &&
      positive(pricing.stepWeightG) &&
      nonNegative(pricing.stepPrice) &&
      pricing.firstPrice + pricing.stepPrice > 0
    );
  }
  return positive(pricing.pricePerKg) && nonNegative(pricing.minWeightG) && nonNegative(pricing.roundingG);
}

export function isValidFees(fees: Fees): boolean {
  return percentage(fees.fuelPct) && nonNegative(fees.serviceFee) && percentage(fees.paymentPct) && percentage(fees.vipPct);
}

/**
 * Order of operations: shipping by weight, plus fuel surcharge on shipping,
 * minus the shipping discount, plus the fixed service fee, plus the payment fee
 * on everything paid.
 */
export function estimate(parcel: Parcel, pricing: Pricing, fees: Fees = noFees): Estimate | null {
  if (!positive(parcel.weightG) || !isValidPricing(pricing) || !isValidFees(fees)) return null;
  const volumetricG = volumetricWeightG(parcel);
  const volumetricWins = volumetricG !== null && volumetricG > parcel.weightG;
  const chargeableG = chargeableWeightG(Math.max(parcel.weightG, volumetricG ?? 0), pricing);
  const base = baseCost(chargeableG, pricing);
  const fuel = (base * fees.fuelPct) / 100;
  const discount = ((base + fuel) * fees.vipPct) / 100;
  const service = fees.serviceFee;
  const payment = ((base + fuel - discount + service) * fees.paymentPct) / 100;
  const total = base + fuel - discount + service + payment;
  return {
    volumetricG,
    chargeableG,
    volumetricWins,
    base: round2(base),
    fuel: round2(fuel),
    discount: round2(discount),
    service: round2(service),
    payment: round2(payment),
    total: round2(total),
  };
}
