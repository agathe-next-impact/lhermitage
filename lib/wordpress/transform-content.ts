import { transformWordPressUrl } from "./url-transform"

/**
 * Transform all links in HTML content to use frontend URLs
 * @param html - HTML string with WordPress links
 * @returns HTML string with transformed links
 */
export function transformContentLinks(html: string): string {
  if (!html) return html

  // Replace all href attributes in anchor tags
  return html.replace(/href="([^"]*)"/g, (match, url) => {
    const transformedUrl = transformWordPressUrl(url)
    return `href="${transformedUrl}"`
  })
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
