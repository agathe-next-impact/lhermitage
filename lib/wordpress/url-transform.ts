/**
 * Transform WordPress URLs to frontend URLs
 * Converts full WordPress URLs to relative paths for the Next.js frontend
 */

import { sanitizeUrl } from "./sanitize"

/**
 * WordPress path → Next.js route mapping.
 * When a WordPress page hierarchy differs from the dedicated Next.js route,
 * add an entry here so all links (menu, ACF, content) point to the right page.
 * Keys: WordPress pathname (without leading/trailing slashes).
 * Values: Next.js route (with leading slash).
 */
const WP_TO_NEXTJS_ROUTES: Record<string, string> = {
  "soutenir-le-projet/devenir-societaire-cooperative-fonciere": "/participer/devenir-societaire",
}

const WP_API_URL = process.env.WP_API_URL || "https://admin.hermitagelelab.com/wp-json/wp/v2"

// Extract the WordPress base URL from the API URL
const getWordPressBaseUrl = (): string => WP_API_URL.replace(/\/wp-json\/wp\/v2\/?$/, "")

const primaryHostname = (() => {
  try {
    return new URL(getWordPressBaseUrl()).hostname
  } catch {
    return "localhost"
  }
})()

/**
 * Transform a WordPress URL to a frontend URL.
 * Works regardless of which WordPress domain is in the URL.
 * @param url - The WordPress URL (e.g., "https://admin.hermitagelelab.com/sejours-collectifs")
 * @returns The frontend URL (e.g., "/sejours-collectifs")
 */
export function transformWordPressUrl(url: string): string {
  if (!url) return "/"

  // If it's already a relative URL, check route mapping then return
  if (url.startsWith("/")) {
    const wpPath = url.replace(/^\/+|\/+$/g, "")
    return WP_TO_NEXTJS_ROUTES[wpPath] || url
  }

  // Parse the URL to check if it's a known WordPress domain
  try {
    const parsed = new URL(url)
    if (parsed.hostname === primaryHostname) {
      const pathname = parsed.pathname || "/"
      const wpPath = pathname.replace(/^\/+|\/+$/g, "")
      return WP_TO_NEXTJS_ROUTES[wpPath] || pathname
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
    if (parsed.hostname !== primaryHostname) {
      parsed.hostname = primaryHostname
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
