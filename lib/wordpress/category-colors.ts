import { BRAND_COLORS } from "@/lib/theme/colors"

/** Palette cyclique pour les catégories — l'ordre maximise le contraste entre voisins */
export const CATEGORY_PALETTE = [
  BRAND_COLORS.rose,
  BRAND_COLORS.teal,
  BRAND_COLORS.orange,
  BRAND_COLORS.green,
  BRAND_COLORS.darkBlue,
  BRAND_COLORS.coral,
  BRAND_COLORS.dark,
] as const

export function getCategoryColorByIndex(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
}

/** Couleur par slug — utilisé quand on n'a pas l'index (ex: hero-card) */
export function getCategoryColor(categorySlug?: string): string {
  if (!categorySlug) return BRAND_COLORS.coral
  // Hash simple du slug pour choisir une couleur déterministe
  let hash = 0
  for (let i = 0; i < categorySlug.length; i++) {
    hash = ((hash << 5) - hash + categorySlug.charCodeAt(i)) | 0
  }
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length]
}
