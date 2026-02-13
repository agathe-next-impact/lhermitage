/**
 * Transform WordPress URLs to frontend URLs
 * Converts full WordPress URLs to relative paths for the Next.js frontend
 */

import { sanitizeUrl } from "./sanitize"
import { getWpHostname } from "./config"

/** Known WordPress domains — any URL matching these is treated as internal */
const WP_DOMAINS = new Set<string>()

// Primary hostname derived from env vars (WP_GRAPHQL_URL / NEXT_PUBLIC_WP_API_URL)
const primary = getWpHostname()
if (primary !== "localhost") WP_DOMAINS.add(primary)

// Optional: additional legacy domains during migration (comma-separated)
// e.g. WP_LEGACY_DOMAINS=admin.hermitagelelab.com,old-domain.com
const legacy = process.env.WP_LEGACY_DOMAINS
if (legacy) {
  legacy.split(",").map(d => d.trim()).filter(Boolean).forEach(d => WP_DOMAINS.add(d))
}

/**
 * Transform a WordPress URL to a frontend URL.
 * Works regardless of which WordPress domain is in the URL.
 * @param url - The WordPress URL (e.g., "https://admin.hermitagelelab.com/sejours-collectifs")
 * @returns The frontend URL (e.g., "/sejours-collectifs")
 */
export function transformWordPressUrl(url: string): string {
  if (!url) return "/"

  // If it's already a relative URL, return as is
  if (url.startsWith("/")) {
    return url
  }

  // Parse the URL to check if it's a known WordPress domain
  try {
    const parsed = new URL(url)
    if (WP_DOMAINS.has(parsed.hostname)) {
      // Extract just the pathname — works regardless of domain
      return parsed.pathname || "/"
    }
  } catch {
    // Not a valid URL, return as-is
  }

  // External URL — sanitize and return
  return sanitizeUrl(url)
}

/**
 * Rewrite a legacy WordPress URL to the primary domain.
 * Unlike transformWordPressUrl (which returns relative paths for navigation),
 * this preserves the full absolute URL — used for assets (images, media).
 * e.g. "https://wp-asso.com/wp-content/uploads/img.jpg" → "https://admin.hermitagelelab.com/wp-content/uploads/img.jpg"
 */
export function rewriteWordPressAssetUrl(url: string): string {
  if (!url) return url
  try {
    const parsed = new URL(url)
    if (WP_DOMAINS.has(parsed.hostname) && parsed.hostname !== primary) {
      parsed.hostname = primary
      return parsed.toString()
    }
  } catch { /* not a valid URL */ }
  return url
}

/**
 * Transform a WPLink object to use frontend URLs
 * @param link - The WPLink object with a url property
 * @returns The link object with transformed URL
 */
export function transformWPLink<T extends { url: string }>(link: T): T {
  return {
    ...link,
    url: transformWordPressUrl(link.url),
  }
}
