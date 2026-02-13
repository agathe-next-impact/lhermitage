/**
 * WordPress configuration derived from environment variables.
 * Single source of truth — never hardcode WP domains elsewhere.
 */

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL
const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL

/** WordPress hostname (e.g. "admin.hermitagelelab.com") */
export function getWpHostname(): string {
  try {
    const url = WP_GRAPHQL_URL || WP_API_URL
    if (url) return new URL(url).hostname
  } catch { /* ignore */ }
  return "localhost"
}

/** WordPress origin with protocol (e.g. "https://admin.hermitagelelab.com") */
export function getWpOrigin(): string {
  try {
    const url = WP_GRAPHQL_URL || WP_API_URL
    if (url) return new URL(url).origin
  } catch { /* ignore */ }
  return "https://localhost"
}
