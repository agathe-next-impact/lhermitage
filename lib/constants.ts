/** Durées de revalidation ISR centralisées (en secondes) */
export const REVALIDATION = {
  /** Homepage - contenu stable, 2h */
  homepage: 7200,
  /** Pages de listing (hébergements, séjours, activités) - 1h */
  listing: 3600,
  /** Pages de détail ([slug]) - 1h */
  detail: 3600,
  /** Contenu fréquemment mis à jour (structures, événements) - 15min */
  frequent: 900,
} as const

/**
 * Mapping route frontend → ID de page WordPress.
 *
 * Les slugs WordPress ont été modifiés (suffixes SEO « -tiers-lieu-hermitage »),
 * les URIs ne correspondent plus aux routes Next.js. On résout les pages par leur
 * databaseId (stable) plutôt que par leur URI (instable).
 */
export const ROUTE_TO_PAGE_ID: Record<string, number> = {
  // — Séjours collectifs —
  "sejours-collectifs": 62,
  "sejours-collectifs/nos-sejours": 67,
  "sejours-collectifs/activites": 71,
  "sejours-collectifs/espaces-de-travail": 859,
  "sejours-collectifs/services": 73,
  "hebergements": 69,

  // — Infos pratiques —
  "infos-pratiques/contacts": 104,
  "infos-pratiques/localisation": 100,
  "infos-pratiques/jours-et-horaires-douverture": 102,
  "ecosysteme-innovant/evenements": 96,

  // — Soutenir / Participer —
  "soutenir-le-projet/devenir-societaire-cooperative-fonciere": 487,
  "participer/devenir-societaire": 487,

  // — Vous engager (CDI, CDD, Alternance, Stage = page 630) —
  "vous-engager/offres-demploi": 630,
  "vous-engager/alternance": 630,
  "vous-engager/stages": 630,
  // — Vous engager (Bénévolat, Service civique, Pass Permis = page 632) —
  "vous-engager/services-civique": 632,
  "vous-engager/pass-permis": 632,

  // — Tiers-lieu rural (catch-all) —
  "tiers-lieu-rural": 79,
  "tiers-lieu-rural/le-domaine-de-l-hermitage": 83,
  "tiers-lieu-rural/un-patrimoine-historique": 81,
  "tiers-lieu-rural/le-projet": 2050,
  "tiers-lieu-rural/ecosysteme-innovant": 2065,
  "tiers-lieu-rural/organisation": 91,

  // — Soutenir le projet (catch-all) —
  "soutenir-le-projet": 485,
  "soutenir-le-projet/don-association": 491,
  "soutenir-le-projet/contribuer-fond-dotation": 489,
} as const

/**
 * Mapping inverse : ID de page WordPress → route frontend canonique.
 *
 * Utilisé par le menu pour résoudre le href correct à partir du
 * connectedNode.databaseId. Quand un même ID WP est partagé par
 * plusieurs routes (ex : 630 → offres-demploi, alternance, stages),
 * seule la route « principale » est listée ici.
 */
export const PAGE_ID_TO_ROUTE: Record<number, string> = {
  138: "/",
  // — Séjours collectifs —
  62: "/sejours-collectifs",
  67: "/sejours-collectifs/nos-sejours",
  69: "/hebergements",
  71: "/sejours-collectifs/activites",
  73: "/sejours-collectifs/services",
  859: "/sejours-collectifs/espaces-de-travail",
  // — Infos pratiques —
  98: "/infos-pratiques",
  96: "/ecosysteme-innovant/evenements",
  100: "/infos-pratiques/localisation",
  102: "/infos-pratiques/jours-et-horaires-douverture",
  104: "/infos-pratiques/contacts",
  // — Soutenir / Participer —
  485: "/soutenir-le-projet",
  487: "/participer/devenir-societaire",
  489: "/soutenir-le-projet/contribuer-fond-dotation",
  491: "/soutenir-le-projet/don-association",
  // — Vous engager —
  620: "/vous-engager",
  630: "/vous-engager/offres-demploi",
  632: "/vous-engager/services-civique",
  // — Tiers-lieu rural —
  79: "/tiers-lieu-rural",
  81: "/tiers-lieu-rural/un-patrimoine-historique",
  83: "/tiers-lieu-rural/le-domaine-de-l-hermitage",
  91: "/tiers-lieu-rural/organisation",
  2050: "/tiers-lieu-rural/le-projet",
  2065: "/tiers-lieu-rural/ecosysteme-innovant",
} as const
