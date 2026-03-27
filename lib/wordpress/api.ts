import type {
  WPPost,
  WPPage,
  GlobalOptionsACF,
  WPMenuItem,
  WPTerm,
  TeamMemberACF,
  HebergementACF,
  SejourACF,
  ActiviteACF,
  ServiceACF,
  StructureACF,
  EvenementACF,
  PartenaireACF,
  EspaceDeTravailACF,
  SeminairesACF,
  PatrimoineACF,
  FooterOptions,
} from "./types"
import { gqlRequest, gqlRequestList } from "./graphql/client"
import {
  transformPage,
  transformPost,
  transformHebergementAcf,
  transformActiviteAcf,
  transformStructureAcf,
  transformEvenementAcf,
  transformPartenaireAcf,
  transformTeamMemberAcf,
  transformEspaceDeTravailAcf,
  transformSejourAcf,
  transformServiceAcf,
  transformSeminairesData,
  transformPatrimoineData,
  transformMenuItems,
  transformTerm,
} from "./graphql/transformers"
import {
  GET_PAGE_BY_SLUG,
  GET_PAGE_BY_ID,
  GET_ALL_PAGES,
  GET_ALL_PAGE_PATHS,
  GET_PAGE_VIDEO_DENTETE,
  GET_PAGE_PATRIMOINE_DATA,
} from "./graphql/queries/pages"
import {
  GET_HEBERGEMENTS,
  GET_HEBERGEMENT_BY_SLUG,
  GET_ACTIVITES,
  GET_ACTIVITE_BY_SLUG,
  GET_STRUCTURES,
  GET_STRUCTURE_BY_SLUG,
  GET_EVENEMENTS,
  GET_PARTENAIRES,
  GET_ESPACES_DE_TRAVAIL,
  GET_TEAM_MEMBERS,
  GET_SERVICES,
} from "./graphql/queries/posts"
import { GET_SEJOURS, GET_SEJOUR_BY_SLUG } from "./graphql/queries/sejours"
import { GET_PAGE_SEMINAIRES } from "./graphql/queries/seminaires"
import { GET_MENU } from "./graphql/queries/menu"
import { GET_TYPES_DE_PARTENAIRE } from "./graphql/queries/taxonomy"
import { rewriteWordPressAssetUrl } from "./url-transform"
import { logger } from "../logger"

export class WordPressAPI {
  // --- Pages ---

  async getPages(): Promise<WPPage[]> {
    const allPages: WPPage[] = []
    let hasMore = true
    let after: string | null = null

    type PagesResponse = {
      pages: {
        pageInfo: { hasNextPage: boolean; endCursor: string }
        nodes: any[]
      }
    }

    while (hasMore) {
      const data: PagesResponse = await gqlRequestList<PagesResponse>(GET_ALL_PAGES, {
        first: 100,
        after,
      })

      const nodes = data.pages?.nodes || []
      allPages.push(...nodes.map(transformPage))

      hasMore = data.pages?.pageInfo?.hasNextPage || false
      after = data.pages?.pageInfo?.endCursor || null
    }

    return allPages
  }

  // Lightweight version of getPages() — only fetches link/slug for generateStaticParams
  async getPagePaths(): Promise<{ link: string; slug: string }[]> {
    const allPaths: { link: string; slug: string }[] = []
    let hasMore = true
    let after: string | null = null

    type PathsResponse = {
      pages: {
        pageInfo: { hasNextPage: boolean; endCursor: string }
        nodes: { databaseId: number; slug: string; link: string; status: string }[]
      }
    }

    while (hasMore) {
      const data: PathsResponse = await gqlRequestList<PathsResponse>(GET_ALL_PAGE_PATHS, {
        first: 100,
        after,
      })

      const nodes = data.pages?.nodes || []
      allPaths.push(...nodes.map((n) => ({ link: n.link, slug: n.slug })))

      hasMore = data.pages?.pageInfo?.hasNextPage || false
      after = data.pages?.pageInfo?.endCursor || null
    }

    return allPaths
  }

  async getPageBySlug(slug: string): Promise<WPPage | null> {
    try {
      const data = await gqlRequest<{ page: any | null }>(GET_PAGE_BY_SLUG, { slug })
      if (!data.page) return null
      return transformPage(data.page)
    } catch (error) {
      logger.error("Failed to fetch page by slug:", slug, error instanceof Error ? error.message : error)
      return null
    }
  }

  async getPageByPath(path: string): Promise<WPPage | null> {
    const cleanPath = path.replace(/^\/+|\/+$/g, "")
    if (!cleanPath) return null

    // WPGraphQL URI idType handles full paths — use it directly.
    // No slug-only fallback to avoid matching a wrong page with the same slug
    // under a different parent hierarchy.
    const page = await this.getPageBySlug(cleanPath)
    if (page) return page

    // Only fall back to slug-only for single-segment paths (no ambiguity)
    const segments = cleanPath.split("/").filter(Boolean)
    if (segments.length > 1) {
      return this.getPageBySlug(segments[segments.length - 1])
    }

    return null
  }

  async getPageById(id: number): Promise<WPPage> {
    const data = await gqlRequest<{ page: any }>(GET_PAGE_BY_ID, { id: String(id) })
    return transformPage(data.page)
  }

  // --- Generic post methods (kept for backwards compatibility) ---

  async getPosts<T = any>(
    postType: string,
    _params?: { per_page?: number; orderby?: string; order?: string }
  ): Promise<WPPost<T>[]> {
    // Route to specific typed methods
    switch (postType) {
      case "hebergement":
        return this.getHebergements() as Promise<WPPost<T>[]>
      case "activite":
        return this.getActivites() as Promise<WPPost<T>[]>
      case "evenement":
        return this.getEvenements() as Promise<WPPost<T>[]>
      case "partenaire":
        return this.getPartenaires() as Promise<WPPost<T>[]>
      case "structure":
        return this.getStructures() as Promise<WPPost<T>[]>
      case "espace-de-travail":
        return this.getEspacesDeTravail() as Promise<WPPost<T>[]>
      case "sejour":
        return this.getSejours() as Promise<WPPost<T>[]>
      case "membre":
        return this.getTeamMembers() as Promise<WPPost<T>[]>
      case "service":
        return this.getServices() as Promise<WPPost<T>[]>
      default:
        logger.error(`Unknown post type for GraphQL: ${postType}`)
        return []
    }
  }

  async getPostBySlug<T = any>(postType: string, slug: string): Promise<WPPost<T> | null> {
    switch (postType) {
      case "hebergement":
        return this.getHebergementBySlug(slug) as Promise<WPPost<T> | null>
      case "activite":
        return this.getActiviteBySlug(slug) as Promise<WPPost<T> | null>
      case "sejour":
        return this.getSejourBySlug(slug) as Promise<WPPost<T> | null>
      case "structure":
        return this.getStructureBySlug(slug) as Promise<WPPost<T> | null>
      default:
        logger.error(`Unknown post type for GraphQL getPostBySlug: ${postType}`)
        return null
    }
  }

  // --- Specific typed methods ---

  async getHebergements(): Promise<WPPost<HebergementACF>[]> {
    try {
      const data = await gqlRequestList<{ hBergements: { nodes: any[] } }>(GET_HEBERGEMENTS)
      const nodes = data.hBergements?.nodes || []
      return nodes.map((node) =>
        transformPost<HebergementACF>(node, transformHebergementAcf(node), "hebergement")
      )
    } catch (error) {
      logger.error("Failed to fetch hebergements:", error)
      return []
    }
  }

  async getHebergementBySlug(slug: string): Promise<WPPost<HebergementACF> | null> {
    try {
      const data = await gqlRequest<{ hBergement: any | null }>(GET_HEBERGEMENT_BY_SLUG, { slug })
      if (!data.hBergement) return null
      return transformPost<HebergementACF>(
        data.hBergement,
        transformHebergementAcf(data.hBergement),
        "hebergement"
      )
    } catch (error) {
      logger.error("Failed to fetch hebergement by slug:", slug, error instanceof Error ? error.message : error)
      return null
    }
  }

  async getActivites(): Promise<WPPost<ActiviteACF>[]> {
    try {
      const data = await gqlRequestList<{ activitS: { nodes: any[] } }>(GET_ACTIVITES)
      const nodes = data.activitS?.nodes || []
      return nodes.map((node) => {
        const post = transformPost<ActiviteACF>(node, transformActiviteAcf(node), "activite")
        // Inject taxonomy terms into _embedded["wp:term"] for filter compatibility
        const typeTerms = node.typesDactivites?.nodes
        if (typeTerms?.length) {
          if (!post._embedded) post._embedded = {}
          post._embedded["wp:term"] = [
            typeTerms.map((t: any) => ({
              id: t.databaseId,
              name: t.name,
              slug: t.slug,
              taxonomy: "type-dactivite",
              display_order: t.displayOrder ?? 0,
            })),
          ]
        }
        return post
      })
    } catch (error) {
      logger.error("Failed to fetch activites:", error)
      return []
    }
  }

  async getActiviteBySlug(slug: string): Promise<WPPost<ActiviteACF> | null> {
    try {
      const data = await gqlRequest<{ activit: any | null }>(GET_ACTIVITE_BY_SLUG, { slug })
      if (!data.activit) return null
      const post = transformPost<ActiviteACF>(
        data.activit,
        transformActiviteAcf(data.activit),
        "activite"
      )
      const typeTerms = data.activit.typesDactivites?.nodes
      if (typeTerms?.length) {
        if (!post._embedded) post._embedded = {}
        post._embedded["wp:term"] = [
          typeTerms.map((t: any) => ({
            id: t.databaseId,
            name: t.name,
            slug: t.slug,
            taxonomy: "type-dactivite",
            display_order: t.displayOrder ?? 0,
          })),
        ]
      }
      return post
    } catch (error) {
      logger.error("Failed to fetch activite by slug:", slug, error instanceof Error ? error.message : error)
      return null
    }
  }

  async getServices(): Promise<WPPost<ServiceACF>[]> {
    try {
      const data = await gqlRequestList<{ services: { nodes: any[] } }>(GET_SERVICES)
      const nodes = data.services?.nodes || []
      return nodes.map((node) => {
        const post = transformPost<ServiceACF>(node, transformServiceAcf(node), "service")
        // Inject taxonomy terms into _embedded["wp:term"] for filter compatibility
        const typeTerms = node.typesDeServices?.nodes
        if (typeTerms?.length) {
          if (!post._embedded) post._embedded = {}
          post._embedded["wp:term"] = [
            typeTerms.map((t: any) => ({
              id: t.databaseId,
              name: t.name,
              slug: t.slug,
              taxonomy: "type-de-service",
              display_order: t.displayOrder ?? 0,
              image: t.image ? {
                url: t.image.sourceUrl,
                alt: t.image.altText || "",
              } : null,
            })),
          ]
        }
        return post
      })
    } catch (error) {
      logger.error("Failed to fetch services:", error)
      return []
    }
  }

  async getStructures(): Promise<WPPost<StructureACF>[]> {
    try {
      const data = await gqlRequestList<{ structures: { nodes: any[] } }>(GET_STRUCTURES)
      const nodes = data.structures?.nodes || []
      return nodes.map((node) => {
        const post = transformPost<StructureACF>(node, transformStructureAcf(node), "structure")
        // Add featured_media_url for backwards compatibility
        return {
          ...post,
          featured_media_url: node.featuredImage?.node?.sourceUrl
            ? rewriteWordPressAssetUrl(node.featuredImage.node.sourceUrl)
            : null,
        }
      })
    } catch (error) {
      logger.error("Failed to fetch structures:", error)
      return []
    }
  }

  async getStructureBySlug(slug: string): Promise<WPPost<StructureACF> | null> {
    try {
      const data = await gqlRequest<{ structure: any | null }>(GET_STRUCTURE_BY_SLUG, { slug })
      if (!data.structure) return null
      return transformPost<StructureACF>(
        data.structure,
        transformStructureAcf(data.structure),
        "structure"
      )
    } catch (error) {
      logger.error("Failed to fetch structure by slug:", slug, error instanceof Error ? error.message : error)
      return null
    }
  }

  async getEvenements(): Promise<WPPost<EvenementACF>[]> {
    try {
      const data = await gqlRequestList<{ evenements: { nodes: any[] } }>(GET_EVENEMENTS)
      const nodes = data.evenements?.nodes || []
      return nodes.map((node) => {
        const post = transformPost<EvenementACF>(node, transformEvenementAcf(node), "evenement")
        // Inject taxonomy terms into _embedded["wp:term"] for filter compatibility
        const catTerms = node.categoriesEvenement?.nodes
        if (catTerms?.length) {
          if (!post._embedded) post._embedded = {}
          post._embedded["wp:term"] = [
            catTerms.map((t: any) => ({
              id: t.databaseId,
              name: t.name,
              slug: t.slug,
              taxonomy: "categorie-evenement",
            })),
          ]
        }
        return post
      })
    } catch (error) {
      logger.error("Failed to fetch evenements:", error)
      return []
    }
  }

  async getPartenaires(): Promise<WPPost<PartenaireACF>[]> {
    try {
      const data = await gqlRequestList<{ partenaires: { nodes: any[] } }>(GET_PARTENAIRES)
      const nodes = data.partenaires?.nodes || []
      return nodes.map((node) => {
        const post = transformPost<PartenaireACF>(node, transformPartenaireAcf(node), "partenaire")
        // Inject taxonomy terms into _embedded["wp:term"] for filter compatibility
        const taxTerms = node.typesDePartenaire?.nodes
        if (taxTerms?.length) {
          if (!post._embedded) post._embedded = {}
          post._embedded["wp:term"] = [
            taxTerms.map((t: any) => ({
              id: t.databaseId,
              name: t.name,
              slug: t.slug,
              taxonomy: "type-de-partenaire",
            })),
          ]
        }
        return post
      })
    } catch (error) {
      logger.error("Failed to fetch partenaires:", error)
      return []
    }
  }

  async getEspacesDeTravail(): Promise<WPPost<EspaceDeTravailACF>[]> {
    try {
      const data = await gqlRequestList<{ espacesDeTravail: { nodes: any[] } }>(
        GET_ESPACES_DE_TRAVAIL
      )
      const nodes = data.espacesDeTravail?.nodes || []
      return nodes.map((node) =>
        transformPost<EspaceDeTravailACF>(
          node,
          transformEspaceDeTravailAcf(node),
          "espace-de-travail"
        )
      )
    } catch (error) {
      logger.error("Failed to fetch espaces de travail:", error)
      return []
    }
  }

  async getTeamMembers(): Promise<WPPost<TeamMemberACF>[]> {
    try {
      const data = await gqlRequestList<{ equipes: { nodes: any[] } }>(GET_TEAM_MEMBERS)
      const nodes = data.equipes?.nodes || []
      return nodes.map((node) =>
        transformPost<TeamMemberACF>(node, transformTeamMemberAcf(node), "membre")
      )
    } catch (error) {
      logger.error("Error fetching team members:", error)
      return []
    }
  }

  // --- Séminaires (separate query to avoid breaking pages if ACF not imported) ---

  async getSeminairesData(path: string): Promise<SeminairesACF | null> {
    try {
      const data = await gqlRequest<{ page: any | null }>(GET_PAGE_SEMINAIRES, { slug: path })
      if (!data.page?.pageSeminaires) return null
      return transformSeminairesData(data.page.pageSeminaires)
    } catch (error) {
      logger.error("Failed to fetch seminaires data for path:", path, error instanceof Error ? error.message : error)
      return null
    }
  }

  // --- Séjours (N+1 eliminated — single GraphQL query with nested relations) ---

  async getSejours(): Promise<WPPost<SejourACF>[]> {
    try {
      const data = await gqlRequestList<{ sJours: { nodes: any[] } }>(GET_SEJOURS)
      const nodes = data.sJours?.nodes || []
      return nodes.map((node) => transformPost<SejourACF>(node, transformSejourAcf(node), "sejour"))
    } catch (error) {
      logger.error("Error in getSejours():", error instanceof Error ? error.message : error)
      return []
    }
  }

  async getSejourBySlug(slug: string): Promise<WPPost<SejourACF> | null> {
    try {
      const data = await gqlRequest<{ sJour: any | null }>(GET_SEJOUR_BY_SLUG, { slug })
      if (!data.sJour) return null
      return transformPost<SejourACF>(data.sJour, transformSejourAcf(data.sJour), "sejour")
    } catch (error) {
      logger.error("Failed to fetch sejour by slug:", slug, error instanceof Error ? error.message : error)
      return null
    }
  }

  // --- Map pin points ---

  async getMapPinPoints() {
    try {
      const [structures, hebergements, espacesDeTravail] = await Promise.all([
        this.getStructures(),
        this.getHebergements(),
        this.getEspacesDeTravail(),
      ])

      const allPosts = [...structures, ...hebergements, ...espacesDeTravail]

      return allPosts
        .filter((post) => {
          const hasVisibility = post.acf?.visibilite === true
          const latitude = post.acf?.position?.latitude
          const longitude = post.acf?.position?.longitude
          const hasPosition = latitude !== undefined && longitude !== undefined
          return hasVisibility && hasPosition
        })
        .map((post) => {
          const optimizedImages = Array.isArray(post.acf?.images)
            ? post.acf.images.slice(0, 1).map((img: any) => ({
                url: img.sizes?.thumbnail || img.url,
                alt: img.alt || post.title.rendered,
              }))
            : []

          const pinPointDescription = post.acf?.descriptifPinPoint || post.acf?.descriptif
          const shortDescription = pinPointDescription
            ? pinPointDescription.replace(/<[^>]*>/g, "").substring(0, 100)
            : undefined

          return {
            id: post.id,
            type: post.type,
            title: post.title.rendered,
            slug: post.slug,
            link: post.link,
            mapPinPoint: {
              visibilite: true,
              nom: post.acf?.nom,
              images: optimizedImages,
              descriptif: shortDescription,
              lien: post.acf?.lien,
              position: post.acf?.position,
            },
          }
        })
    } catch (error) {
      logger.error("Error fetching map pin points:", error)
      return []
    }
  }

  // --- Homepage ---

  async getHomepage(): Promise<WPPage> {
    const homepageId = process.env.HOMEPAGE_ID ? parseInt(process.env.HOMEPAGE_ID, 10) : 138
    return this.getPageById(homepageId)
  }

  // --- Global options ---

  async getGlobalOptions(): Promise<GlobalOptionsACF> {
    // The ACF "Menu" field group is not currently exposed in the WordPress GraphQL schema
    // (OptionsGlobales type only has menuTitle/pageTitle). When re-enabled in WP admin
    // ("Show in GraphQL"), restore the GET_GLOBAL_OPTIONS query here.
    return {
      lien_du_cta_de_barre_superieure: {
        title: "Réserver",
        url: process.env.DEFAULT_CTA_URL || "/reserver",
        target: "",
      },
      miniature_du_megamenu: {
        titre_cta_1: "Découvrir le lieu",
        lien_cta_1: {
          title: "Découvrir le lieu",
          url: "/visite-virtuelle",
          target: "",
        },
        image: {
          id: 0,
          url: "/rural-retreat-hermitage-building-nature.jpg",
          alt: "Vue de l'Hermitage",
          width: 1920,
          height: 1080,
        },
      },
    }
  }

  // --- Menu ---

  async getMenu(menuSlug = "menu-1"): Promise<WPMenuItem[]> {
    try {
      const data = await gqlRequest<{
        menu: {
          menuItems: {
            nodes: Array<{
              databaseId: number
              label: string
              url: string
              parentDatabaseId: number | null
              order: number
            }>
          }
        } | null
      }>(GET_MENU, { slug: menuSlug }, { revalidate: 3600 })

      if (!data.menu?.menuItems?.nodes) return []
      return transformMenuItems(data.menu.menuItems.nodes)
    } catch (error) {
      logger.error("Error fetching menu:", error)
      return []
    }
  }

  // --- Footer ---

  async getFooterOptions(): Promise<FooterOptions> {
    try {
      const wpUrl =
        process.env.WP_GRAPHQL_URL?.replace("/graphql", "") || "https://admin.hermitagelelab.com"
      const res = await fetch(`${wpUrl}/wp-json/lhermitage/v1/footer`, {
        next: { revalidate: 3600 },
      })
      if (!res.ok) throw new Error(`Footer API returned ${res.status}`)
      return await res.json()
    } catch (error) {
      logger.warn("Footer options not available, using fallbacks:", error)
      return {
        logo: {
          url: "/logo-hermitage.svg",
          alt: "L'Hermitage",
        },
        description:
          "L'Hermitage est un tiers-lieu rural dédié aux transitions écologiques et sociales, situé à Autrêches dans l'Oise.",
        copyright: `© ${new Date().getFullYear()} L'Hermitage. Tous droits réservés.`,
        social: {
          facebook: "https://www.facebook.com/lhermitagetierslieu",
          instagram: "https://www.instagram.com/lhermitage_tiers_lieu",
          linkedin: "https://www.linkedin.com/company/l-hermitage-tiers-lieu",
          youtube: "https://www.youtube.com/@lhermitage",
        },
        columns: [
          {
            title: "Séjours",
            links: [
              { label: "Séjours Collectifs", url: "/sejours-collectifs" },
              { label: "Hébergements", url: "/hebergements" },
              { label: "Activités", url: "/sejours-collectifs/activites" },
            ],
          },
          {
            title: "Écosystème",
            links: [
              { label: "Structures", url: "/ecosysteme-innovant/structures-hebergees" },
              { label: "Partenaires", url: "/ecosysteme-innovant/partenaires" },
              { label: "Événements", url: "/ecosysteme-innovant/evenements" },
            ],
          },
          {
            title: "L'Hermitage",
            links: [
              { label: "Notre histoire", url: "/histoire" },
              { label: "Devenir sociétaire", url: "/devenir-societaire" },
              { label: "Contact", url: "/contact" },
            ],
          },
        ],
        contact: {
          adresse: "L'Hermitage, 60350 Autrêches",
          telephone: "03 44 42 62 62",
          email: "contact@lhermitage.fr",
        },
      }
    }
  }

  // --- Taxonomy ---

  async getPageVideo(
    pagePath: string
  ): Promise<{ url: string; mimeType: string; descriptif?: string } | null> {
    try {
      const data = await gqlRequest<{
        page: {
          pageTiersLieuDInnovation?: {
            videoDentete?: {
              node?: { mediaItemUrl: string; mimeType: string }
            }
            descriptif?: string
          }
        } | null
      }>(GET_PAGE_VIDEO_DENTETE, { slug: pagePath })

      const tiersLieu = data.page?.pageTiersLieuDInnovation
      const videoNode = tiersLieu?.videoDentete?.node
      if (videoNode?.mediaItemUrl || tiersLieu?.descriptif) {
        return {
          url: videoNode?.mediaItemUrl || "",
          mimeType: videoNode?.mimeType || "video/mp4",
          descriptif: tiersLieu?.descriptif || undefined,
        }
      }
      return null
    } catch {
      // Field group not yet configured in WordPress — fail silently
      return null
    }
  }

  // Separate query for patrimoine page data — avoids ACF meta key collision
  // with pageRecrutement when both are in the same GraphQL query.
  async getPatrimoineData(
    pagePath: string
  ): Promise<PatrimoineACF | null> {
    try {
      const data = await gqlRequest<{
        page: { pagePatrimoine?: Record<string, any> } | null
      }>(GET_PAGE_PATRIMOINE_DATA, { slug: pagePath })

      const patData = data.page?.pagePatrimoine
      if (!patData) return null
      return transformPatrimoineData(patData)
    } catch {
      return null
    }
  }

  async getTaxonomyTerms(taxonomy: string): Promise<WPTerm[]> {
    try {
      if (taxonomy === "type-de-partenaire") {
        const data = await gqlRequestList<{
          typesDePartenaire: { nodes: any[] }
        }>(GET_TYPES_DE_PARTENAIRE)
        const nodes = data.typesDePartenaire?.nodes || []
        return nodes.map((node) => transformTerm({ ...node, taxonomyName: taxonomy }))
      }

      // For unknown taxonomies, log a warning
      logger.warn(`Unknown taxonomy for GraphQL: ${taxonomy}. Add a specific query.`)
      return []
    } catch (error) {
      logger.error(`Failed to fetch taxonomy terms for ${taxonomy}:`, error)
      return []
    }
  }
}

export const wpApi = new WordPressAPI()

// React cache() wrapper — deduplicates identical calls within a single Server Component render pass.
// Used by [...slug] catch-all page where generateMetadata() + Page both call getPageByPath().
import { cache } from "react"

export const getPageByPath = cache((path: string) => wpApi.getPageByPath(path))
