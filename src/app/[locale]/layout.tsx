import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { themeScript } from "@/components/layout/ThemeToggle";
import { locales } from "@/i18n/config";
import { dictionaryFor, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  const home = pageMetadata(locale, "home", t.meta.title, t.meta.description);
  return {
    ...home,
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.title, template: "%s · Marisship" },
    applicationName: "Marisship",
    openGraph: {
      ...home.openGraph,
      siteName: "Marisship",
      locale: locale === "it" ? "it_IT" : "en_GB",
      type: "website",
    },
    formatDetection: { telephone: false, address: false, email: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1f3a" },
  ],
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const t = dictionaryFor(locale);
  return (
    <html lang={locale} className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-bold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t.nav.skip}
        </a>
        <Header locale={locale} t={t} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}
