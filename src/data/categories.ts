// Product categories shared by the official stores directory and the catalogs.
// Labels live in the dictionaries under `categories`.

export const categories = [
  "electronics",
  "home",
  "appliances",
  "clothing",
  "sport",
  "bags",
  "accessories",
  "toys",
  "stationery",
  "outdoor",
] as const;

export type Category = (typeof categories)[number];
