import { BRAND_COLORS } from "@/lib/theme/colors"

export const CATEGORY_COLORS: Record<string, string> = {
  "atelier-de-facilitation": BRAND_COLORS.rose,
  "zero-dechets": BRAND_COLORS.green,
  "prendre-lair": BRAND_COLORS.teal,
  "festivite": BRAND_COLORS.orange,
  "decouverte-du-site": BRAND_COLORS.darkBlue,
  default: BRAND_COLORS.coral,
}

export function getCategoryColor(categorySlug?: string): string {
  if (!categorySlug) return CATEGORY_COLORS.default
  return CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS.default
}
