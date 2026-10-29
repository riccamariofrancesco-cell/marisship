import { loadLegal } from "@/content/mdx";
import type { Locale } from "@/i18n/config";
import { PageHero } from "./PageHero";

export async function LegalPage({
  locale,
  page,
  title,
  intro,
}: {
  locale: Locale;
  page: "privacy" | "terms";
  title: string;
  intro: string;
}) {
  const Body = await loadLegal(page, locale);
  return (
    <>
      <PageHero title={title} intro={intro} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="prose-sea">
          <Body />
        </div>
      </div>
    </>
  );
}
