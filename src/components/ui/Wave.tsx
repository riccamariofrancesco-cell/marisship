/** Full-width wave edge; fill follows `currentColor`. */
export function Wave({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        fill="currentColor"
        d="M0 48c120-28 240-28 360 0s240 28 360 0 240-28 360 0 240 28 360 0v32H0z"
      />
    </svg>
  );
}
