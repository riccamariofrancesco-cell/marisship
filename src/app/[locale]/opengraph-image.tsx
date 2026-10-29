import { ImageResponse } from "next/og";
import { defaultLocale, isLocale } from "@/i18n/config";
import { dictionaryFor } from "@/i18n/dictionaries";

export const alt = "Marisship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image routes are Route Handlers, where next/root-params is not available yet:
// the locale comes from the params prop instead.
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  const t = dictionaryFor(isLocale(value) ? value : defaultLocale);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f6efe3",
          color: "#0b1f3a",
          padding: "72px 80px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="132" height="132" viewBox="0 0 64 64">
            <path d="M13 37 L22 8 L32 27 L42 8 L51 37 Z" fill="#ff6b4a" />
            <path d="M9 40 H55 L48.5 49 H15.5 Z" fill="#12355b" />
            <path
              d="M5 56 q 6.75 -6 13.5 0 t 13.5 0 t 13.5 0 t 13.5 0"
              fill="none"
              stroke="#1f6f8b"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
            <span>Maris</span>
            <span style={{ color: "#1f6f8b" }}>ship</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 44, lineHeight: 1.25, maxWidth: 980, color: "#2c3e55" }}>
          {t.meta.ogTagline}
        </div>
        <svg width="1200" height="120" viewBox="0 0 1200 120" style={{ marginLeft: -80 }}>
          <path d="M0 60 q75 -40 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 V120 H0 Z" fill="#1f6f8b" />
          <path d="M0 90 q75 -30 150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 t150 0 V120 H0 Z" fill="#12355b" />
        </svg>
      </div>
    ),
    size,
  );
}
