import Link from "next/link";
import type { ReactNode } from "react";
import { HeroScene } from "@/components/brand/HeroScene";
import {
  AnchorIcon,
  ArrowRightIcon,
  CompassIcon,
  CrateIcon,
  LighthouseIcon,
  LinkIcon,
  SpyglassIcon,
  WeightIcon,
} from "@/components/icons";
import { guides } from "@/content/guides";
import { converterAgents } from "@/data/agents";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";

export default async function HomePage() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);

  const tools: { key: "calculator" | "converter" | "hold" | "search" | "agents"; icon: ReactNode }[] = [
    { key: "calculator", icon: <WeightIcon className="h-6 w-6" /> },
    { key: "converter", icon: <LinkIcon className="h-6 w-6" /> },
    { key: "hold", icon: <CrateIcon className="h-6 w-6" /> },
    { key: "search", icon: <SpyglassIcon className="h-6 w-6" /> },
    { key: "agents", icon: <LighthouseIcon className="h-6 w-6" /> },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-accent-text">{t.home.eyebrow}</p>
            <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              {t.home.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">{t.home.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={href(locale, "calculator")} className="btn btn-primary">
                {t.home.ctaCalculator}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href={href(locale, "converter")} className="btn btn-ghost">
                {t.home.ctaConverter}
              </Link>
            </div>
          </div>
          <HeroScene className="mx-auto w-full max-w-[17rem] sm:max-w-sm lg:max-w-md" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="tools-title">
        <h2 id="tools-title" className="font-display text-3xl font-semibold">
          {t.home.toolsTitle}
        </h2>
        <p className="mt-2 text-muted">{t.home.toolsIntro}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ key, icon }) => (
            <li key={key}>
              <Link
                href={href(locale, key)}
                className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-sea"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-foam text-sea">{icon}</span>
                <span className="mt-4 font-display text-xl font-semibold">{t.nav[key]}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t.home.tools[key]}</span>
                <ArrowRightIcon className="mt-4 h-5 w-5 text-link transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={href(locale, "guides")}
              className="flex h-full flex-col justify-center rounded-[1.25rem] border border-dashed border-line p-6 transition hover:border-sea"
            >
              <CompassIcon className="h-7 w-7 text-brass" />
              <span className="mt-3 font-display text-xl font-semibold">{t.nav.guides}</span>
              <span className="mt-1 text-sm text-muted">{t.guides.intro}</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="steps-title">
        <h2 id="steps-title" className="font-display text-3xl font-semibold">
          {t.home.stepsTitle}
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {t.home.steps.map((step, index) => (
            <li key={step.title} className="relative border-t-2 border-dashed border-sea pt-6">
              <span className="font-display text-5xl font-semibold text-accent" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24 bg-band text-on-band" aria-labelledby="promises-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="promises-title" className="font-display text-3xl font-semibold">
            {t.home.promisesTitle}
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.promises.map((promise) => (
              <li key={promise.title}>
                <AnchorIcon className="h-7 w-7 opacity-80" />
                <h3 className="mt-3 text-lg font-bold">{promise.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-85">{promise.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="agents-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="agents-title" className="font-display text-3xl font-semibold">
            {t.home.agentsTitle}
          </h2>
          <Link href={href(locale, "agents")} className="link font-semibold">
            {t.home.agentsLink}
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-3">
          {converterAgents.map((agent) => (
            <li key={agent.slug} className="rounded-full border border-line bg-surface px-4 py-2 font-semibold">
              {agent.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="guides-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="guides-title" className="font-display text-3xl font-semibold">
            {t.home.guidesTitle}
          </h2>
          <Link href={href(locale, "guides")} className="link font-semibold">
            {t.home.guidesLink}
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.id}>
              <Link
                href={href(locale, "guides", guide.slug[locale])}
                className="card flex h-full flex-col p-6 transition hover:border-sea"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {fill(t.common.readTime, { n: guide.minutes })}
                </span>
                <span className="mt-2 font-display text-xl font-semibold">{guide.title[locale]}</span>
                <span className="mt-2 text-sm leading-relaxed text-muted">{guide.summary[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="card border-l-4 border-l-brass p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">{t.home.counterfeitTitle}</h2>
          <p className="mt-2 max-w-3xl text-muted">{t.home.counterfeitText}</p>
        </div>
      </section>
    </>
  );
}
