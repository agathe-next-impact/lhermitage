/**
 * Transform WordPress URLs to frontend URLs
 * Converts full WordPress URLs to relative paths for the Next.js frontend
 */

import { sanitizeUrl } from "./sanitize"

const WP_API_URL = process.env.WP_API_URL || "https://wp-asso.com/wp-json/wp/v2"

// Extract the WordPress base URL from the API URL
const getWordPressBaseUrl = (): string => {
  // Remove /wp-json/wp/v2 from the end to get the base URL
  return WP_API_URL.replace(/\/wp-json\/wp\/v2\/?$/, "")
}

/**
 * Transform a WordPress URL to a frontend URL
 * @param url - The WordPress URL (e.g., "https://wp-asso.com/sejours-collectifs")
 * @returns The frontend URL (e.g., "/sejours-collectifs")
 */
export function transformWordPressUrl(url: string): string {
  if (!url) return "/"

  // If it's already a relative URL, return as is
  if (url.startsWith("/")) {
    return url
  }

  // If it's an external URL (not from WordPress), sanitize protocol and return
  const wpBaseUrl = getWordPressBaseUrl()
  if (!url.startsWith(wpBaseUrl)) {
    return sanitizeUrl(url)
  }

  // Remove the WordPress base URL to get the path
  const path = url.replace(wpBaseUrl, "")

  // Ensure it starts with /
  return path.startsWith("/") ? path : `/${path}`
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
