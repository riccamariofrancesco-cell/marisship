import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { href } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";

export default async function NotFound() {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <LogoMark className="h-20 w-20 -rotate-12 opacity-80" />
      <h1 className="mt-6 font-display text-4xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-3 text-muted">{t.notFound.text}</p>
      <Link href={href(locale, "home")} className="btn btn-primary mt-8">
        {t.notFound.home}
      </Link>
    </section>
  );
}
