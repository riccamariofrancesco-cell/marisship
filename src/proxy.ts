import { NextResponse, type NextRequest } from "next/server";
import { isLocale, negotiateLocale, routeKeyForAnySlug, routeKeyForSlug, routes } from "@/i18n/config";

// 1. Paths without a locale prefix are redirected to the visitor's locale.
// 2. Localized slugs (e.g. /it/calcolatore-spedizioni) are rewritten to the
//    English folder names used under app/[locale].
// 3. A slug from the wrong locale (e.g. /it/shipping-calculator) is redirected
//    to the canonical localized URL.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const [first, second, ...rest] = segments;

  if (!isLocale(first)) {
    // No language cookie: Marisship sets no cookies at all.
    const locale = negotiateLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (!second) return NextResponse.next();

  const key = routeKeyForSlug(first, second);
  if (key) {
    const internal = routes[key].en;
    if (internal === second) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/${[first, internal, ...rest].join("/")}`;
    return NextResponse.rewrite(url);
  }

  const foreignKey = routeKeyForAnySlug(second);
  if (foreignKey) {
    const url = request.nextUrl.clone();
    url.pathname = `/${[first, routes[foreignKey][first], ...rest].join("/")}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and any path with a file extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
