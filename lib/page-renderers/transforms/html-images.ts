/**
 * Extract image URLs and alt text from HTML content.
 * Shared utility used by activites, espaces-de-travail, and services pages.
 */
export function extractImagesFromHtml(html: string): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const altMatch = match[0].match(/alt=["']([^"']*)["']/)
    images.push({ src: match[1], alt: altMatch?.[1] || "" })
  }
  return images
}
