import { BRAND_COLORS } from "@/lib/theme/colors"

// Fixed color sequence assigned to menu cards by position (1st card → teal, 2nd → green, etc.)
export const MENU_COLOR_SEQUENCE = [
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.coral,
  BRAND_COLORS.darkBlue,
] as const

// Fallback static mapping for pages outside of menu or when context is unavailable
// (e.g. detail pages with dynamic slugs like /sejour/[slug], /structure/[slug])
export const PAGE_COLORS: Record<string, string> = {
  "/sejours-collectifs": BRAND_COLORS.teal,
  "/sejours-individuels": BRAND_COLORS.teal,
  "/hebergements": BRAND_COLORS.teal,
  "/hebergement": BRAND_COLORS.teal,
  "/sejour": BRAND_COLORS.teal,
  "/activite": BRAND_COLORS.teal,

  "/ecosysteme-innovant": BRAND_COLORS.green,
  "/structure": BRAND_COLORS.green,

  "/tiers-lieu-rural": BRAND_COLORS.rose,
  "/le-projet": BRAND_COLORS.rose,
  "/le-concept": BRAND_COLORS.rose,
  "/nos-valeurs": BRAND_COLORS.rose,
  "/lequipe": BRAND_COLORS.rose,
  "/visite-virtuelle": BRAND_COLORS.rose,
  "/lhistoire-du-lieu": BRAND_COLORS.rose,
  "/le-domaine": BRAND_COLORS.rose,

  "/infos-pratiques": BRAND_COLORS.orange,
  "/services": BRAND_COLORS.orange,

  "/participer": BRAND_COLORS.coral,
  "/reserver": BRAND_COLORS.coral,
}

export function getColorForPath(pathname: string): string | undefined {
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname

  if (PAGE_COLORS[normalizedPath]) {
    return PAGE_COLORS[normalizedPath]
  }

  const sortedKeys = Object.keys(PAGE_COLORS).sort((a, b) => b.length - a.length)

  for (const key of sortedKeys) {
    if (normalizedPath.startsWith(key)) {
      return PAGE_COLORS[key]
    }
  }

  return undefined
}

/**
 * Build a route → color map from menu items.
 * Each parent menu item gets the next color from MENU_COLOR_SEQUENCE.
 * All child routes inherit the parent's color.
 */
export function buildRouteColorMap(
  menuCards: { links?: { href: string }[] }[]
): Record<string, string> {
  const map: Record<string, string> = {}

  menuCards.forEach((card, index) => {
    const color = MENU_COLOR_SEQUENCE[index % MENU_COLOR_SEQUENCE.length]

    for (const link of card.links || []) {
      map[link.href] = color

      // Also map the route prefix (e.g. /infos-pratiques/contacts → /infos-pratiques)
      const segments = link.href.split("/").filter(Boolean)
      if (segments.length > 0) {
        map[`/${segments[0]}`] = color
      }
    }
  })

  return map
}
