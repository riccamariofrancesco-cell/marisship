import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  icon,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
      <div className="flex items-start gap-4">
        {icon ? (
          <span className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foam text-sea sm:inline-flex">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-text">{eyebrow}</p>
          ) : null}
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          {intro ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{intro}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
