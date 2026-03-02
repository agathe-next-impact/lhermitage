import { BRAND_COLORS } from "@/lib/theme/colors"

// Mapping between routes and megamenu card colors
export const PAGE_COLORS: Record<string, string> = {
  "/sejours-collectifs": BRAND_COLORS.teal,
  "/sejours-individuels": BRAND_COLORS.teal,
  "/hebergements": BRAND_COLORS.teal,
  "/hebergement": BRAND_COLORS.teal,
  "/sejour": BRAND_COLORS.teal,
  "/activite": BRAND_COLORS.teal,
  "/services": BRAND_COLORS.teal,

  "/ecosysteme-innovant": BRAND_COLORS.green,

  "/tiers-lieu-rural": BRAND_COLORS.rose,
  "/le-projet": BRAND_COLORS.rose,
  "/le-concept": BRAND_COLORS.rose,
  "/nos-valeurs": BRAND_COLORS.rose,
  "/lequipe": BRAND_COLORS.rose,
  "/visite-virtuelle": BRAND_COLORS.rose,
  "/lhistoire-du-lieu": BRAND_COLORS.rose,
  "/le-domaine": BRAND_COLORS.rose,

  "/infos-pratiques": BRAND_COLORS.orange,

  "/participer": BRAND_COLORS.coral,

  "/reserver": BRAND_COLORS.coral,
}

export function getColorForPath(pathname: string): string | undefined {
  // Remove trailing slash for consistency
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname

  // Direct match
  if (PAGE_COLORS[normalizedPath]) {
    return PAGE_COLORS[normalizedPath]
  }

  // Check if pathname starts with any of the keys (for nested routes)
  // Sort keys by length descending to match more specific paths first
  const sortedKeys = Object.keys(PAGE_COLORS).sort((a, b) => b.length - a.length)

  for (const key of sortedKeys) {
    if (normalizedPath.startsWith(key)) {
      return PAGE_COLORS[key]
    }
  }

  return undefined
}
