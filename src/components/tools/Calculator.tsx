"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Field, toNumber } from "@/components/ui/Field";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, formatMoney, formatNumber, formatWeight } from "@/i18n/format";
import type { FxRates } from "@/lib/fx";
import { estimate, type Fees, type Parcel, type Pricing } from "@/lib/shipping/calc";
import type { ShippingLine } from "@/lib/shipping/lines";
import { RATES_FILE_URL } from "@/lib/site";

type Currency = "EUR" | "USD";

interface Props {
  locale: Locale;
  t: Dictionary["calculator"];
  fx: FxRates | null;
  lines: ShippingLine[];
  agentNames: Record<string, string>;
}

/** Reads `?w=<grams>` sent by the Hold; must render inside <Suspense>. */
export function CalculatorFromQuery(props: Props) {
  const params = useSearchParams();
  const w = params.get("w");
  const grams = w && /^\d{1,7}$/.test(w) ? w : "";
  return <Calculator key={grams} {...props} initialWeight={grams} />;
}

export function Calculator({ locale, t, fx, lines, agentNames, initialWeight = "" }: Props & { initialWeight?: string }) {
  const id = useId();
  const [weight, setWeight] = useState(initialWeight);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [divisor, setDivisor] = useState("6000");
  const [model, setModel] = useState<"step" | "perKg">("step");
  const [firstWeight, setFirstWeight] = useState("500");
  const [firstPrice, setFirstPrice] = useState("");
  const [stepWeight, setStepWeight] = useState("500");
  const [stepPrice, setStepPrice] = useState("");
  const [perKg, setPerKg] = useState("");
  const [minWeight, setMinWeight] = useState("0");
  const [rounding, setRounding] = useState("100");
  const [fuel, setFuel] = useState("0");
  const [service, setService] = useState("0");
  const [payment, setPayment] = useState("0");
  const [vip, setVip] = useState("0");
  const [currency, setCurrency] = useState<Currency>(locale === "it" ? "EUR" : "USD");
  const [rates, setRates] = useState<Record<Currency, string>>({
    EUR: fx ? String(fx.EUR) : "",
    USD: fx ? String(fx.USD) : "",
  });

  const parcel: Parcel = {
    weightG: toNumber(weight),
    lengthCm: toNumber(length) || undefined,
    widthCm: toNumber(width) || undefined,
    heightCm: toNumber(height) || undefined,
    divisor: toNumber(divisor),
  };
  const pricing: Pricing =
    model === "step"
      ? {
          type: "step",
          firstWeightG: toNumber(firstWeight),
          firstPrice: toNumber(firstPrice),
          stepWeightG: toNumber(stepWeight),
          stepPrice: toNumber(stepPrice),
        }
      : { type: "perKg", pricePerKg: toNumber(perKg), minWeightG: toNumber(minWeight) || 0, roundingG: toNumber(rounding) || 0 };
  const fees: Fees = {
    fuelPct: toNumber(fuel) || 0,
    serviceFee: toNumber(service) || 0,
    paymentPct: toNumber(payment) || 0,
    vipPct: toNumber(vip) || 0,
  };
  const result = estimate(parcel, pricing, fees);
  const rate = toNumber(rates[currency]);
  const converted = result && rate > 0 ? result.total * rate : null;

  const cny = (value: number) => formatMoney(locale, value, "CNY");
  const input = (name: string) => `${id}-${name}`;
  const numberProps = { inputMode: "decimal" as const, className: "field pr-12", autoComplete: "off" };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="space-y-6">
        <fieldset className="card p-5 sm:p-6">
          <legend className="sr-only">{t.parcel}</legend>
          <h2 className="font-display text-xl font-semibold" aria-hidden="true">
            {t.parcel}
          </h2>
          {initialWeight ? <p className="mt-2 text-sm text-link">{t.fromHold}</p> : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id={input("weight")} label={t.weight} suffix="g">
              <input id={input("weight")} {...numberProps} value={weight} onChange={(e) => setWeight(e.target.value)} />
            </Field>
            <Field id={input("divisor")} label={t.divisor} help={t.divisorHelp}>
              <select id={input("divisor")} className="field" value={divisor} onChange={(e) => setDivisor(e.target.value)}>
                {["5000", "6000", "8000"].map((d) => (
                  <option key={d} value={d}>
                    {formatNumber(locale, Number(d), 0)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="mt-5 text-sm font-semibold">{t.dimensions}</p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {(
              [
                ["length", t.length, length, setLength],
                ["width", t.width, width, setWidth],
                ["height", t.height, height, setHeight],
              ] as const
            ).map(([name, label, value, set]) => (
              <Field key={name} id={input(name)} label={label} suffix="cm">
                <input id={input(name)} {...numberProps} value={value} onChange={(e) => set(e.target.value)} />
              </Field>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-5 sm:p-6">
          <legend className="sr-only">{t.rate}</legend>
          <h2 className="font-display text-xl font-semibold" aria-hidden="true">
            {t.rate}
          </h2>
          <p className="mt-1 text-sm text-muted">{t.rateHelp}</p>
          <div role="radiogroup" aria-label={t.model} className="mt-4 inline-flex flex-wrap gap-1 rounded-full bg-surface-2 p-1">
            {(["step", "perKg"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={model === value}
                onClick={() => setModel(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  model === value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
                }`}
              >
                {value === "step" ? t.modelStep : t.modelPerKg}
              </button>
            ))}
          </div>
          {model === "step" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id={input("fw")} label={t.firstWeight} suffix="g">
                <input id={input("fw")} {...numberProps} value={firstWeight} onChange={(e) => setFirstWeight(e.target.value)} />
              </Field>
              <Field id={input("fp")} label={t.firstPrice} suffix="CNY">
                <input id={input("fp")} {...numberProps} className="field pr-14" value={firstPrice} onChange={(e) => setFirstPrice(e.target.value)} />
              </Field>
              <Field id={input("sw")} label={t.stepWeight} suffix="g">
                <input id={input("sw")} {...numberProps} value={stepWeight} onChange={(e) => setStepWeight(e.target.value)} />
              </Field>
              <Field id={input("sp")} label={t.stepPrice} suffix="CNY">
                <input id={input("sp")} {...numberProps} className="field pr-14" value={stepPrice} onChange={(e) => setStepPrice(e.target.value)} />
              </Field>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field id={input("kg")} label={t.perKg} suffix="CNY">
                <input id={input("kg")} {...numberProps} className="field pr-14" value={perKg} onChange={(e) => setPerKg(e.target.value)} />
              </Field>
              <Field id={input("min")} label={t.minWeight} suffix="g">
                <input id={input("min")} {...numberProps} value={minWeight} onChange={(e) => setMinWeight(e.target.value)} />
              </Field>
              <Field id={input("round")} label={t.rounding} suffix="g">
                <input id={input("round")} {...numberProps} value={rounding} onChange={(e) => setRounding(e.target.value)} />
              </Field>
            </div>
          )}
        </fieldset>

        <fieldset className="card p-5 sm:p-6">
          <legend className="sr-only">{t.fees}</legend>
          <h2 className="font-display text-xl font-semibold" aria-hidden="true">
            {t.fees}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id={input("fuel")} label={t.fuel} suffix="%">
              <input id={input("fuel")} {...numberProps} value={fuel} onChange={(e) => setFuel(e.target.value)} />
            </Field>
            <Field id={input("vip")} label={t.vip} help={t.vipHelp} suffix="%">
              <input id={input("vip")} {...numberProps} value={vip} onChange={(e) => setVip(e.target.value)} />
            </Field>
            <Field id={input("service")} label={t.service} suffix="CNY">
              <input id={input("service")} {...numberProps} className="field pr-14" value={service} onChange={(e) => setService(e.target.value)} />
            </Field>
            <Field id={input("payment")} label={t.payment} suffix="%">
              <input id={input("payment")} {...numberProps} value={payment} onChange={(e) => setPayment(e.target.value)} />
            </Field>
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24" aria-labelledby={input("result")}>
        <div className="card overflow-hidden">
          <div className="bg-band px-5 py-4 text-on-band sm:px-6">
            <h2 id={input("result")} className="font-display text-xl font-semibold">
              {t.result}
            </h2>
          </div>
          <div className="p-5 sm:p-6" aria-live="polite">
            {result ? (
              <>
                <dl className="space-y-2 text-sm">
                  {result.volumetricG !== null ? (
                    <Row label={t.volumetric} value={formatWeight(locale, result.volumetricG)} />
                  ) : null}
                  <Row label={t.chargeable} value={formatWeight(locale, result.chargeableG)} strong />
                  <p className="pb-2 text-xs text-muted">{result.volumetricWins ? t.volumetricWins : t.actualWins}</p>
                  <Row label={t.base} value={cny(result.base)} />
                  {result.fuel ? <Row label={t.fuelLine} value={`+ ${cny(result.fuel)}`} /> : null}
                  {result.discount ? <Row label={t.vipLine} value={`− ${cny(result.discount)}`} /> : null}
                  {result.service ? <Row label={t.serviceLine} value={`+ ${cny(result.service)}`} /> : null}
                  {result.payment ? <Row label={t.paymentLine} value={`+ ${cny(result.payment)}`} /> : null}
                </dl>
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-sm text-muted">{t.total}</p>
                  <p className="font-display text-4xl font-semibold" data-testid="calc-total">
                    {cny(result.total)}
                  </p>
                  {converted !== null ? (
                    <p className="mt-1 text-lg font-semibold text-link" data-testid="calc-converted">
                      ≈ {formatMoney(locale, converted, currency)}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">{t.invalid}</p>
            )}

            <div className="mt-6 grid grid-cols-[auto_1fr] items-end gap-3 border-t border-line pt-4">
              <Field id={input("cur")} label={t.currency}>
                <select
                  id={input("cur")}
                  className="field"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
              <Field id={input("fx")} label={t.fxRate} suffix={currency}>
                <input
                  id={input("fx")}
                  {...numberProps}
                  className="field pr-14"
                  value={rates[currency]}
                  onChange={(e) => setRates((r) => ({ ...r, [currency]: e.target.value }))}
                />
              </Field>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {fx ? fill(t.fxSource, { date: formatDate(locale, fx.date) }) : t.fxManual}
            </p>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-2" aria-labelledby={input("compare")}>
        <h2 id={input("compare")} className="font-display text-2xl font-semibold">
          {t.compareTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.compareIntro}</p>
        <CompareLines
          locale={locale}
          t={t}
          lines={lines}
          parcel={parcel}
          agentNames={agentNames}
        />
      </section>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "font-semibold" : "text-muted"}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}

function CompareLines({
  locale,
  t,
  lines,
  parcel,
  agentNames,
}: {
  locale: Locale;
  t: Dictionary["calculator"];
  lines: ShippingLine[];
  parcel: Parcel;
  agentNames: Record<string, string>;
}) {
  const countries = useMemo(() => [...new Set(lines.flatMap((l) => l.countries))].sort(), [lines]);
  const [country, setCountry] = useState(countries.includes("IT") ? "IT" : (countries[0] ?? ""));
  const selectId = useId();

  if (lines.length === 0) {
    return (
      <div className="card mt-4 border-dashed p-5 text-sm">
        <p className="text-muted">{t.compareEmpty}</p>
        <a className="link mt-2 inline-block font-semibold" href={RATES_FILE_URL} rel="noopener">
          {t.compareContribute}
        </a>
      </div>
    );
  }

  const rows = lines
    .filter((line) => line.countries.includes(country))
    .map((line) => ({ line, result: estimate({ ...parcel, divisor: line.divisor }, line.pricing) }))
    .sort((a, b) => (a.result?.total ?? Infinity) - (b.result?.total ?? Infinity));

  return (
    <div className="mt-4">
      <div className="max-w-xs">
        <Field id={selectId} label={t.compareCountry}>
          <select id={selectId} className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{t.compareAgent}</th>
              <th className="px-4 py-3 font-semibold">{t.compareLine}</th>
              <th className="px-4 py-3 font-semibold">{t.compareDays}</th>
              <th className="px-4 py-3 font-semibold">{t.compareTotal}</th>
              <th className="px-4 py-3 font-semibold">{t.compareVerified}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ line, result }) => (
              <tr key={`${line.agent}-${line.name}`} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{agentNames[line.agent] ?? line.agent}</td>
                <td className="px-4 py-3">{line.name}</td>
                <td className="px-4 py-3">{line.days ? `${line.days[0]}–${line.days[1]}` : "—"}</td>
                <td className="px-4 py-3 tabular-nums">{result ? formatMoney(locale, result.total, "CNY") : "—"}</td>
                <td className="px-4 py-3">
                  <a className="link" href={line.source} rel="noopener">
                    {line.lastVerified}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
