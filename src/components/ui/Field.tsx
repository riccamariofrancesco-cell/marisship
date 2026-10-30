import type { ReactNode } from "react";

/** Label + control + optional help text, stacked. */
export function Field({
  id,
  label,
  help,
  suffix,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  suffix?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        {children}
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
            {suffix}
          </span>
        ) : null}
      </div>
      {help ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-muted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** Parses a user-typed number, accepting a comma as decimal separator. */
export function toNumber(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? Number.NaN : Number(normalized);
}
