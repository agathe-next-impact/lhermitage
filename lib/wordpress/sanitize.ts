import DOMPurify from "isomorphic-dompurify"

/** Tags HTML autorisés pour le contenu WordPress */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "caption",
  "div",
  "span",
  "figure",
  "figcaption",
  "hr",
  "sup",
  "sub",
]

/** Attributs autorisés par tag */
const ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "class",
  "id",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "decoding",
  "colspan",
  "rowspan",
  "scope",
]

/**
 * Sanitize du HTML provenant de WordPress (content.rendered, ACF descriptif, etc.).
 * Supprime les scripts, event handlers, iframes et tout contenu dangereux.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ""
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })
}

/** Domaines autorisés pour les embeds vidéo */
const TRUSTED_VIDEO_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "vimeo.com",
  "www.dailymotion.com",
]

/**
 * Sanitize un embed vidéo HTML de WordPress.
 * Extrait le src de l'iframe et ne l'autorise que s'il provient d'un domaine de confiance.
 * Ajoute un attribut `sandbox` pour isoler l'iframe.
 */
export function sanitizeVideoEmbed(dirty: string): string | null {
  if (!dirty) return null

  const srcMatch = dirty.match(/src=["']([^"']+)["']/)
  if (!srcMatch?.[1]) return null

  const iframeSrc = srcMatch[1]

  try {
    const url = new URL(iframeSrc)
    if (!TRUSTED_VIDEO_HOSTS.includes(url.hostname)) {
      return null
    }
    if (!["https:", "http:"].includes(url.protocol)) {
      return null
    }
  } catch {
    return null
  }

  // Reconstruire un iframe sécurisé
  const titleMatch = dirty.match(/title=["']([^"']*)["']/)
  const title = titleMatch?.[1] || "Vidéo"

  return `<iframe src="${iframeSrc}" title="${title}" sandbox="allow-scripts allow-same-origin allow-presentation" allow="fullscreen" style="width:100%;height:100%;border:0" loading="lazy"></iframe>`
}

/**
 * Vérifie qu'une URL utilise un protocole sûr (http/https uniquement).
 * Bloque javascript:, data:, vbscript: etc.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "/"
  try {
    const parsed = new URL(url, "https://placeholder.com")
    if (!["https:", "http:"].includes(parsed.protocol)) {
      return "/"
    }
    return url
  } catch {
    // URL relative — probablement sûre
    if (url.startsWith("/")) return url
    return "/"
  }
}
