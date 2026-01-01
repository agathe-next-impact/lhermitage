// Mapping between routes and megamenu card colors
// These colors match exactly the megamenu cards in site-header.tsx
export const PAGE_COLORS: Record<string, string> = {
  "/sejours-collectifs": "#56939F",
  "/sejours-individuels": "#56939F",
  "/hebergements": "#56939F",
  "/hebergement": "#56939F",
  "/sejour": "#56939F",
  "/activite": "#56939F",
  "/services": "#56939F",

  "/ecosysteme-innovant": "#78AD7D",

  "/tiers-lieu-rural": "#C14C66",
  "/le-projet": "#C14C66",
  "/le-concept": "#C14C66",
  "/nos-valeurs": "#C14C66",
  "/lequipe": "#C14C66",
  "/visite-virtuelle": "#C14C66",
  "/lhistoire-du-lieu": "#C14C66",
  "/le-domaine": "#C14C66",

  "/infos-pratiques": "#DC6F45",

  "/participer": "#E75754",
}

export function getColorForPath(pathname: string): string | undefined {
  // Remove trailing slash for consistency
  const normalizedPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname

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
