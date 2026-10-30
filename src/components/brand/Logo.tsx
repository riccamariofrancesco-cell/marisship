// Marisship mark: an M-shaped sail over a hull and a wave.

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M13 37 L22 8 L32 27 L42 8 L51 37 Z" fill="var(--accent)" />
      <path d="M9 40 H55 L48.5 49 H15.5 Z" fill="var(--ocean)" />
      <path
        d="M5 56 q 6.75 -6 13.5 0 t 13.5 0 t 13.5 0 t 13.5 0"
        fill="none"
        stroke="var(--sea)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="font-display text-[1.45rem] leading-none font-semibold tracking-tight">
        Maris<span className="text-sea">ship</span>
      </span>
    </span>
  );
}
