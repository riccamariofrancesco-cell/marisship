export const REPO_URL = "https://github.com/riccamariofrancesco-cell/marisship";
export const ISSUES_URL = `${REPO_URL}/issues/new`;
export const RATES_FILE_URL = `${REPO_URL}/blob/main/src/data/shipping-lines.json`;

/** Absolute site URL for metadata, sitemap and robots. */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
