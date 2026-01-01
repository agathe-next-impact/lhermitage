export const CATEGORY_COLORS: Record<string, string> = {
  "atelier-de-facilitation": "#C14C66", // Rose
  "zero-dechets": "#78AD7D", // Vert
  "prendre-lair": "#56939F", // Teal
  "festivite": "#DC6F45", // Orange
  "decouverte-du-site": "#2A4A51", // Bleu foncé
  default: "#E75754", // Corail (couleur par défaut)
}

export function getCategoryColor(categorySlug?: string): string {
  if (!categorySlug) return CATEGORY_COLORS.default
  return CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS.default
}
