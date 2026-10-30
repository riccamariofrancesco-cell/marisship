// Decorative hero illustration: the Marisship boat seen through a porthole.

export function HeroScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <defs>
        <clipPath id="porthole">
          <circle cx="200" cy="200" r="168" />
        </clipPath>
      </defs>
      <circle cx="200" cy="200" r="190" fill="var(--brass)" />
      <circle cx="200" cy="200" r="176" fill="var(--surface)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <circle
          key={angle}
          cx={200 + 183 * Math.cos((angle * Math.PI) / 180)}
          cy={200 + 183 * Math.sin((angle * Math.PI) / 180)}
          r="4"
          fill="var(--surface)"
          opacity="0.75"
        />
      ))}
      <g clipPath="url(#porthole)">
        <rect x="0" y="0" width="400" height="400" fill="var(--foam)" />
        <circle cx="285" cy="118" r="38" fill="var(--brass)" opacity="0.85" />
        <g fill="none" stroke="var(--muted)" strokeWidth="2.4" strokeLinecap="round" opacity="0.6">
          <path d="M92 112 q8 -7 16 0 q8 -7 16 0" />
          <path d="M136 88 q6 -5 12 0 q6 -5 12 0" />
        </g>
        <g className="swell">
          <path d="M120 236 L152 128 L192 202 L232 128 L264 236 Z" fill="var(--accent)" />
          <path d="M192 202 V240" stroke="var(--ocean)" strokeWidth="5" strokeLinecap="round" />
          <path d="M102 244 H282 L258 280 H126 Z" fill="var(--ocean)" />
          <circle cx="156" cy="262" r="4.5" fill="var(--foam)" />
          <circle cx="192" cy="262" r="4.5" fill="var(--foam)" />
          <circle cx="228" cy="262" r="4.5" fill="var(--foam)" />
        </g>
        <path d="M0 288 q33 -20 66 0 t66 0 t66 0 t66 0 t66 0 t66 0 t66 0 V400 H0 Z" fill="var(--sea)" />
        <path d="M-30 318 q33 -18 66 0 t66 0 t66 0 t66 0 t66 0 t66 0 t66 0 V400 H-30 Z" fill="var(--band)" />
        <g fill="none" stroke="var(--foam)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          <path d="M70 306 q10 -6 20 0" />
          <path d="M290 302 q10 -6 20 0" />
          <path d="M180 340 q12 -7 24 0" />
        </g>
      </g>
      <circle cx="200" cy="200" r="168" fill="none" stroke="var(--ink)" strokeOpacity="0.12" strokeWidth="2" />
    </svg>
  );
}
