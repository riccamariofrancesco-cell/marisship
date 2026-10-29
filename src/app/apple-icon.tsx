import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b1f3a" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M13 37 L22 8 L32 27 L42 8 L51 37 Z" fill="#ff6b4a" />
          <path d="M9 40 H55 L48.5 49 H15.5 Z" fill="#f6efe3" />
          <path
            d="M5 56 q 6.75 -6 13.5 0 t 13.5 0 t 13.5 0 t 13.5 0"
            fill="none"
            stroke="#5fb3cc"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
