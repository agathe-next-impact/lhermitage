/**
 * Decode HTML entities from WordPress content
 * WordPress often encodes special characters like é, à, etc. as HTML entities
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window === "undefined") {
    // Server-side: use a simple regex-based approach
    const entities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#039;": "'",
      "&apos;": "'",
      "&nbsp;": " ",
      "&eacute;": "é",
      "&egrave;": "è",
      "&ecirc;": "ê",
      "&euml;": "ë",
      "&agrave;": "à",
      "&acirc;": "â",
      "&auml;": "ä",
      "&ocirc;": "ô",
      "&ouml;": "ö",
      "&ugrave;": "ù",
      "&ucirc;": "û",
      "&uuml;": "ü",
      "&icirc;": "î",
      "&iuml;": "ï",
      "&ccedil;": "ç",
      "&Eacute;": "É",
      "&Egrave;": "È",
      "&Ecirc;": "Ê",
      "&Euml;": "Ë",
      "&Agrave;": "À",
      "&Acirc;": "Â",
      "&Auml;": "Ä",
      "&Ocirc;": "Ô",
      "&Ouml;": "Ö",
      "&Ugrave;": "Ù",
      "&Ucirc;": "Û",
      "&Uuml;": "Ü",
      "&Icirc;": "Î",
      "&Iuml;": "Ï",
      "&Ccedil;": "Ç",
      "&rsquo;": "'",
      "&lsquo;": "'",
      "&rdquo;": '"',
      "&ldquo;": '"',
      "&hellip;": "…",
      "&ndash;": "–",
      "&mdash;": "—",
    }

    let decoded = text

    // Replace named entities
    Object.keys(entities).forEach((entity) => {
      decoded = decoded.replace(new RegExp(entity, "g"), entities[entity])
    })

    // Replace numeric entities (&#123; or &#xAB;)
    decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(dec)
    })
    decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
      return String.fromCharCode(Number.parseInt(hex, 16))
    })

    return decoded
  } else {
    // Client-side: use DOM API for accurate decoding
    const textarea = document.createElement("textarea")
    textarea.innerHTML = text
    return textarea.value
  }
}

/**
 * Recursively decode HTML entities in an object
 */
export function decodeObjectEntities<T>(obj: T): T {
  if (typeof obj === "string") {
    return decodeHtmlEntities(obj) as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => decodeObjectEntities(item)) as T
  }

  if (obj && typeof obj === "object") {
    const decoded: any = {}
    for (const key in obj) {
      decoded[key] = decodeObjectEntities((obj as any)[key])
    }
    return decoded as T
  }

  return obj
}

export { decodeHtmlEntities as decode }
