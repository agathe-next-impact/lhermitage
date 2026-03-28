/**
 * Page registry: maps route paths to their rendering configuration.
 *
 * The catch-all [..slug]/page.tsx uses this registry to determine:
 * 1. What extra data to fetch beyond the WP page itself
 * 2. Which renderer component to use
 * 3. Whether the renderer controls its own layout (customLayout)
 *
 * Pages NOT in the registry fall through to the default WP content renderer.
 */
import type { WordPressAPI } from "@/lib/wordpress/api"

export interface PageRouteConfig {
  /** Extra data to fetch in parallel with the WP page. */
  fetchExtra?: (api: WordPressAPI) => Promise<Record<string, unknown>>
  /** Renderer key — maps to a dynamic import in the catch-all. */
  renderer: string
  /** If true, the renderer returns the full page (no PageHeader+BentoHeaderContent wrapper). */
  customLayout?: boolean
}

export const PAGE_REGISTRY: Record<string, PageRouteConfig> = {
  // --- Pages simples (contenu WP seulement) ---
  "sejours-collectifs": { renderer: "wpContent" },
  reserver: { renderer: "reserver" },

  // --- Vous engager (5 pages, même renderer RecrutementPage) ---
  "vous-engager/offres-demploi": { renderer: "recrutement" },
  "vous-engager/alternance": { renderer: "recrutement" },
  "vous-engager/stages": { renderer: "recrutement" },
  "vous-engager/services-civique": { renderer: "recrutement" },
  "vous-engager/pass-permis": { renderer: "recrutement" },

  // --- Pages ACF-only (données dans page.acf) ---
  "participer/devenir-societaire": { renderer: "devenirSocietaire" },
  "infos-pratiques/contacts": { renderer: "contacts" },
  "infos-pratiques/jours-et-horaires-douverture": { renderer: "horaires" },

  // --- Pages listing CPT ---
  hebergements: {
    renderer: "hebergements",
    fetchExtra: (api) => api.getHebergements().then((h) => ({ hebergements: h })),
  },
  "sejours-individuels": {
    renderer: "sejoursIndividuels",
    fetchExtra: (api) => api.getHebergements().then((h) => ({ hebergements: h })),
  },
  "sejours-collectifs/activites": {
    renderer: "activites",
    fetchExtra: (api) => api.getActivites().then((a) => ({ activites: a })),
  },
  "sejours-collectifs/espaces-de-travail": {
    renderer: "espaces",
    fetchExtra: (api) => api.getEspacesDeTravail().then((e) => ({ espaces: e })),
  },
  "sejours-collectifs/services": {
    renderer: "services",
    fetchExtra: (api) => api.getServices().then((s) => ({ services: s })),
  },
  "ecosysteme-innovant/structures": {
    renderer: "structures",
    fetchExtra: (api) => api.getStructures().then((s) => ({ structures: s })),
    customLayout: true,
  },
  "ecosysteme-innovant/partenaires": {
    renderer: "partenaires",
    fetchExtra: async (api) => {
      const [partenaires, categories] = await Promise.all([
        api.getPartenaires(),
        api.getTaxonomyTerms("type-de-partenaire"),
      ])
      return { partenaires, categories }
    },
  },
  "ecosysteme-innovant/evenements": {
    renderer: "evenements",
    fetchExtra: (api) => api.getEvenements().then((e) => ({ evenements: e })),
  },

  // --- Pages complexes ---
  "infos-pratiques/localisation": {
    renderer: "localisation",
    fetchExtra: (api) => api.getMapPinPoints().then((p) => ({ mapPinPoints: p })),
  },
  "sejours-collectifs/nos-sejours": {
    renderer: "nosSejours",
    fetchExtra: async (api) => {
      const [seminairesData, services] = await Promise.all([
        api.getSeminairesData("sejours-collectifs/nos-sejours"),
        api.getServices(),
      ])
      return { seminairesData, services }
    },
    customLayout: true,
  },
  "sejours-collectifs/packs-de-sejours": {
    renderer: "packsSejours",
    customLayout: true,
  },

  // --- Pages existantes du catch-all (migrees dans le registre) ---
  "tiers-lieu-rural/lhistoire-du-lieu": { renderer: "histoire" },
  "tiers-lieu-rural/lequipe": {
    renderer: "equipe",
    fetchExtra: (api) => api.getTeamMembers().then((m) => ({ teamMembers: m })),
  },
  "tiers-lieu-rural/le-domaine-de-l-hermitage": {
    renderer: "domaine",
    fetchExtra: (api) =>
      api
        .getPageVideo("tiers-lieu-rural/le-domaine-de-l-hermitage")
        .then((v) => ({ domaineVideo: v })),
  },
  "tiers-lieu-rural/un-patrimoine-historique": {
    renderer: "patrimoine",
    fetchExtra: (api) =>
      api
        .getPatrimoineData("tiers-lieu-rural/un-patrimoine-historique")
        .then((p) => ({ patrimoineData: p })),
  },
}

// Seminaires pages are matched by prefix, not exact path
export function isSeminairesPage(path: string): boolean {
  return path.startsWith("seminaires") && !PAGE_REGISTRY[path]
}

export function getRouteConfig(path: string): PageRouteConfig | null {
  return PAGE_REGISTRY[path] || null
}
