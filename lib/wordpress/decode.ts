/**
 * Decode HTML entities from WordPress content
 * WordPress often encodes special characters like é, à, etc. as HTML entities
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window === "undefined") {
    // Server-side: use a simple regex-based approach
    const entities: Record<string, string> = {
      // Base HTML entities
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#039;": "'",
      "&apos;": "'",
      "&nbsp;": " ",
      "&shy;": "\u00AD",

      // French accented — lowercase
      "&agrave;": "à",
      "&acirc;": "â",
      "&atilde;": "ã",
      "&auml;": "ä",
      "&ccedil;": "ç",
      "&eacute;": "é",
      "&egrave;": "è",
      "&ecirc;": "ê",
      "&euml;": "ë",
      "&icirc;": "î",
      "&iuml;": "ï",
      "&iacute;": "í",
      "&igrave;": "ì",
      "&ocirc;": "ô",
      "&ouml;": "ö",
      "&ograve;": "ò",
      "&oacute;": "ó",
      "&otilde;": "õ",
      "&ugrave;": "ù",
      "&ucirc;": "û",
      "&uuml;": "ü",
      "&uacute;": "ú",
      "&yacute;": "ý",
      "&yuml;": "ÿ",
      "&ntilde;": "ñ",
      "&szlig;": "ß",
      "&oelig;": "\u0153",
      "&aelig;": "\u00E6",

      // French accented — uppercase
      "&Agrave;": "À",
      "&Acirc;": "Â",
      "&Atilde;": "Ã",
      "&Auml;": "Ä",
      "&Ccedil;": "Ç",
      "&Eacute;": "É",
      "&Egrave;": "È",
      "&Ecirc;": "Ê",
      "&Euml;": "Ë",
      "&Icirc;": "Î",
      "&Iuml;": "Ï",
      "&Iacute;": "Í",
      "&Igrave;": "Ì",
      "&Ocirc;": "Ô",
      "&Ouml;": "Ö",
      "&Ograve;": "Ò",
      "&Oacute;": "Ó",
      "&Otilde;": "Õ",
      "&Ugrave;": "Ù",
      "&Ucirc;": "Û",
      "&Uuml;": "Ü",
      "&Uacute;": "Ú",
      "&Yacute;": "Ý",
      "&Yuml;": "Ÿ",
      "&Ntilde;": "Ñ",
      "&OElig;": "\u0152",
      "&AElig;": "\u00C6",

      // Typographic quotes & punctuation
      "&rsquo;": "\u2019",
      "&lsquo;": "\u2018",
      "&rdquo;": "\u201D",
      "&ldquo;": "\u201C",
      "&laquo;": "\u00AB",
      "&raquo;": "\u00BB",
      "&hellip;": "\u2026",
      "&ndash;": "\u2013",
      "&mdash;": "\u2014",
      "&bull;": "\u2022",
      "&middot;": "\u00B7",
      "&iquest;": "\u00BF",
      "&iexcl;": "\u00A1",

      // Symbols & currency
      "&euro;": "\u20AC",
      "&pound;": "\u00A3",
      "&cent;": "\u00A2",
      "&yen;": "\u00A5",
      "&copy;": "\u00A9",
      "&reg;": "\u00AE",
      "&trade;": "\u2122",
      "&deg;": "\u00B0",
      "&micro;": "\u00B5",
      "&para;": "\u00B6",
      "&sect;": "\u00A7",
      "&ordm;": "\u00BA",
      "&ordf;": "\u00AA",
      "&times;": "\u00D7",
      "&divide;": "\u00F7",
      "&plusmn;": "\u00B1",
      "&not;": "\u00AC",
      "&frac14;": "\u00BC",
      "&frac12;": "\u00BD",
      "&frac34;": "\u00BE",
      "&sup1;": "\u00B9",
      "&sup2;": "\u00B2",
      "&sup3;": "\u00B3",
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
