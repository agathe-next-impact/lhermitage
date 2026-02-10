/** Palette de couleurs de marque centralisée pour L'Hermitage */
export const BRAND_COLORS = {
  coral: "#E75754",
  teal: "#56939F",
  green: "#78AD7D",
  rose: "#C14C66",
  orange: "#DC6F45",
  darkBlue: "#2A4A51",
  dark: "#535353",
} as const

export type BrandColor = (typeof BRAND_COLORS)[keyof typeof BRAND_COLORS]
