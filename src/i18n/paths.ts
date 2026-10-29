import { guideBySlug } from "@/content/guides";
import { href, routes, type Locale, type RouteKey } from "./config";

const keys = Object.keys(routes) as RouteKey[];

/**
 * Route for the first segment below `app/[locale]`, i.e. the English folder
 * name. Segments are the same on the server and in the browser even when the
 * proxy rewrote an Italian slug, so this is safe to use during hydration.
 */
export function routeKeyForSegment(segment: string | undefined): RouteKey | undefined {
  if (!segment) return "home";
  return keys.find((key) => key !== "home" && routes[key].en === segment);
}

/** Equivalent page in another locale; unknown pages fall back to its home page. */
export function switchLocalePath(current: Locale, segments: string[], target: Locale): string {
  const [first, second] = segments;
  const key = routeKeyForSegment(first);
  if (!key) return href(target, "home");
  if (key === "guides" && second) {
    const guide = guideBySlug(current, decodeURIComponent(second));
    return guide ? href(target, "guides", guide.slug[target]) : href(target, "guides");
  }
  return href(target, key);
}
