import type { ReactNode, SVGProps } from "react";

// Hand-drawn 24px stroke icons used across the site.

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const WeightIcon = (p: P) => (
  <Icon {...p}>
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    <path d="M5.2 9h13.6l1.7 11H3.5z" />
    <path d="M10 14.5h4" />
  </Icon>
);

export const LinkIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
);

export const CrateIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
    <path d="m3 7.5 9 4.5 9-4.5" />
    <path d="M12 12v9" />
    <path d="m7.5 5.2 9 4.6" />
  </Icon>
);

export const SpyglassIcon = (p: P) => (
  <Icon {...p}>
    <path d="m3.5 13.5 10-5 1.8 3.6-10 5z" />
    <path d="m15.2 7.6 3.6-1.8 1.8 3.6-3.6 1.8" />
    <path d="m9.5 15.8-2 5.2" />
    <path d="m10.6 15.2 2.9 5.8" />
  </Icon>
);

export const LighthouseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M9 21 10.4 9h3.2L15 21" />
    <path d="M7 21h10" />
    <path d="M10 9V6.5h4V9" />
    <path d="M12 6.5V4" />
    <path d="m4.5 5 3.5 1.5M19.5 5 16 6.5" />
    <path d="M9.8 14h4.4" />
  </Icon>
);

export const CompassIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </Icon>
);

export const SunIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p: P) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Icon>
);

export const MenuIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ExternalIcon = (p: P) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);

export const CopyIcon = (p: P) => (
  <Icon {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Icon>
);

export const CheckIcon = (p: P) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const ArrowRightIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const TrashIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icon>
);

export const AnchorIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v14M8 11h8" />
    <path d="M4.5 13.5A7.5 7.5 0 0 0 12 21a7.5 7.5 0 0 0 7.5-7.5" />
  </Icon>
);

export const StoreIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 10v10h16V10" />
    <path d="M3 10h18l-2-6H5z" />
    <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M10 20v-5h4v5" />
  </Icon>
);

export const LedgerIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M5 17a3 3 0 0 1 3-3h11" />
    <path d="M9 8h6M9 11h4" />
  </Icon>
);
