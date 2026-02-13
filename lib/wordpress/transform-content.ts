import { transformWordPressUrl, rewriteWordPressAssetUrl } from "./url-transform"

/**
 * Transform all URLs in HTML content from WordPress:
 * - href → relative frontend paths (for navigation)
 * - src/srcset/poster → rewritten to primary WP domain (for assets)
 */
export function transformContentLinks(html: string): string {
  if (!html) return html

  // Links: convert to relative frontend paths
  let result = html.replace(/href="([^"]*)"/g, (_match, url) => {
    return `href="${transformWordPressUrl(url)}"`
  })

  // Assets (images, video posters): rewrite legacy domain → primary domain
  result = result.replace(/\b(src|srcset|poster)="([^"]*)"/g, (_match, attr, url) => {
    if (attr === "srcset") {
      // srcset contains comma-separated "url size" pairs
      const rewritten = url.split(",").map((entry: string) => {
        const trimmed = entry.trim()
        const spaceIdx = trimmed.lastIndexOf(" ")
        if (spaceIdx === -1) return rewriteWordPressAssetUrl(trimmed)
        const assetUrl = trimmed.substring(0, spaceIdx)
        const size = trimmed.substring(spaceIdx)
        return rewriteWordPressAssetUrl(assetUrl) + size
      }).join(", ")
      return `${attr}="${rewritten}"`
    }
    return `${attr}="${rewriteWordPressAssetUrl(url)}"`
  })

  return result
}

/**
 * Transform WordPress content to be frontend-ready
 * - Transforms all links to frontend URLs
 * - Preserves all other HTML structure
 * @param content - WordPress content object with rendered property
 * @returns Transformed HTML string
 */
export function transformWordPressContent(content: { rendered: string }): string {
  if (!content?.rendered) return ""
  return transformContentLinks(content.rendered)
}
