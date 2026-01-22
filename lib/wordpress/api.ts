import type { WPPost, WPPage, GlobalOptionsACF, WPMenuItem, WPTerm, TeamMemberACF } from "./types"
import { decodeObjectEntities } from "./decode"
import { logger } from "../logger"

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://wp-asso.com/wp-json/wp/v2"

export class WordPressAPI {
  private baseUrl: string
  private wpJsonBase: string

  constructor(baseUrl: string = WP_API_URL) {
    this.baseUrl = baseUrl
    this.wpJsonBase = baseUrl.replace("/wp/v2", "")
  }

  private async fetch<T>(endpoint: string, params?: Record<string, any>, retries = 2): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased to 15s

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "Next.js WordPress Client",
        },
        signal: controller.signal,
        next: { revalidate: 21600 }, // Cache for 6 hours instead of 4 hours
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const body = await response.text()
        logger.error(`[v0] WordPress API error - Status: ${response.status}`)
        logger.error(`[v0] WordPress API error - Body:`, body.substring(0, 500))

        // For 404 errors, return empty array for list endpoints
        if (response.status === 404) {
          if (endpoint.includes("?") || !/\/\d+$/.test(endpoint)) {
            logger.warn(`[v0] Returning empty array for 404 on endpoint: ${endpoint}`)
            return [] as T
          }
        }

        if (response.status >= 500 && retries > 0) {
          logger.warn(`[v0] Retrying request (${retries} retries left)...`)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000))
          return this.fetch<T>(endpoint, params, retries - 1)
        }

        if (endpoint.includes("?") || !/\/\d+$/.test(endpoint)) {
          logger.error(`[v0] Returning empty array due to error on endpoint: ${endpoint}`)
          return [] as T
        }

        throw new Error(
          `WordPress API error (${response.status}): ${response.statusText}. Check server logs for details.`,
        )
      }

      const data = await response.json()
      return decodeObjectEntities(data)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error(`[v0] Request timeout for ${url}`)

          // Retry on timeout
          if (retries > 0) {
            logger.warn(`[v0] Retrying after timeout (${retries} retries left)...`)
            await new Promise((resolve) => setTimeout(resolve, 3000)) // 3s delay between retries
            return this.fetch<T>(endpoint, params, retries - 1)
          }
        } else if (error.message.includes("fetch")) {
          logger.error(`[v0] Network error fetching ${url}:`, error.message)

          // Retry on network error
          if (retries > 0) {
            logger.warn(`[v0] Retrying after network error (${retries} retries left)...`)
            await new Promise((resolve) => setTimeout(resolve, 3000)) // 3s delay between retries
            return this.fetch<T>(endpoint, params, retries - 1)
          }
        }
      }

      // For list endpoints, return empty array on error
      if (endpoint.includes("?") || !/\/\d+$/.test(endpoint)) {
        logger.error(`[v0] Returning empty array due to error for endpoint: ${endpoint}`)
        return [] as T
      }

      throw error
    }
  }

  // Pages
  async getPages(params?: { parent?: number; per_page?: number }): Promise<WPPage[]> {
    logger.warn("[v0] WordPress API - getPages() called with params:", params)

    const perPage = 100 // WordPress maximum
    let allPages: WPPage[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const pages = await this.fetch<WPPage[]>("/pages", {
        _embed: true,
        acf_format: "standard",
        per_page: perPage,
        page: page,
        orderby: "menu_order",
        order: "asc",
        ...params,
      })

      if (pages.length === 0) {
        hasMore = false
      } else {
        allPages = [...allPages, ...pages]
        if (pages.length < perPage) {
          hasMore = false
        } else {
          page++
        }
      }
    }

    logger.warn("[v0] WordPress API - Total pages fetched:", allPages.length)
    return allPages
  }

  async getPageBySlug(slug: string): Promise<WPPage | null> {
    const pages = await this.fetch<WPPage[]>("/pages", {
      slug,
      _embed: true,
      acf_format: "standard",
    })

    if (pages[0]) {
      logger.warn("[v0] WordPress API - Full page data for slug:", slug)
      logger.warn("[v0] Full page object:", JSON.stringify(pages[0], null, 2))
      logger.warn("[v0] Page title:", pages[0].title?.rendered)
      logger.warn("[v0] Page ACF data:", JSON.stringify(pages[0].acf, null, 2))

      if (pages[0].acf?.hero) {
        logger.warn("[v0] Hero sous-titre:", pages[0].acf.hero["sous-titre"])
        logger.warn("[v0] Hero image:", pages[0].acf.hero.image)
      } else {
        logger.warn("[v0] WARNING: No hero data found in ACF")
      }
    } else {
      logger.warn("[v0] WARNING: No page found for slug:", slug)
    }

    return pages[0] || null
  }

  async getPageByPath(path: string): Promise<WPPage | null> {
    const cleanPath = path.replace(/^\/+|\/+$/g, "")

    logger.warn("[v0] WordPress API - getPageByPath() called with path:", cleanPath)

    const allPages = await this.getPages()

    logger.warn("[v0] WordPress API - Total pages fetched:", allPages.length)

    // Find page that matches the full path
    const page = allPages.find((p) => {
      // WordPress link contains the full URL, extract the path
      const pageUrl = p.link || ""
      const wpBaseUrl = this.baseUrl.replace("/wp-json/wp/v2", "")
      const pagePath = pageUrl.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, "")

      logger.warn(`[v0] Comparing: "${pagePath}" === "${cleanPath}"`)

      return pagePath === cleanPath
    })

    if (page) {
      logger.warn("[v0] WordPress API - Found page by path:", page.title.rendered)
      logger.warn("[v0] Page link:", page.link)
    } else {
      logger.warn("[v0] WordPress API - No page found for path:", cleanPath)
    }

    return page || null
  }

  async getPageById(id: number): Promise<WPPage> {
    return this.fetch<WPPage>(`/pages/${id}`, {
      _embed: true,
      acf_format: "standard",
    })
  }

  // Custom Post Types
  async getPosts<T = any>(
    postType: string,
    params?: { per_page?: number; orderby?: string; order?: string },
  ): Promise<WPPost<T>[]> {
    logger.warn("[v0] WordPress API - getPosts() called for postType:", postType)

    try {
      const result = await this.fetch<WPPost<T>[]>(`/${postType}`, {
        _embed: true,
        acf_format: "standard",
        per_page: params?.per_page || 100,
        ...params,
      })

      logger.warn("[v0] WordPress API - getPosts() returned:", result.length, "items for", postType)
      return result
    } catch (error) {
      logger.error("[v0] WordPress API - getPosts() ERROR for", postType, ":", error)
      return []
    }
  }

  async getPostBySlug<T = any>(postType: string, slug: string): Promise<WPPost<T> | null> {
    const posts = await this.fetch<WPPost<T>[]>(`/${postType}`, {
      slug,
      _embed: true,
      acf_format: "standard",
    })
    return posts[0] || null
  }

  async getPostById<T = any>(postType: string, id: number): Promise<WPPost<T>> {
    return this.fetch<WPPost<T>>(`/${postType}/${id}`, {
      _embed: true,
      acf_format: "standard",
    })
  }

  // Specific post types
  async getSejours() {
    logger.warn("[v0] WordPress API - getSejours() called")

    try {
      // Fetch sejours with embedded data
      const sejours = await this.getPosts("sejour")

      logger.warn("[v0] Sejours fetched:", sejours.length)

      const extractSlugFromUrl = (url: string): string | null => {
        try {
          // URL format: https://wp-asso.com/hebergement/maison-forestiere/
          const urlParts = url.split("/").filter((part) => part.length > 0)
          // Get the last part as slug
          return urlParts[urlParts.length - 1] || null
        } catch (error) {
          logger.error("[v0] Error extracting slug from URL:", url, error)
          return null
        }
      }

      // For each sejour, fetch complete data for hebergements and activites
      const sejoursWithCompleteData = await Promise.all(
        sejours.map(async (sejour) => {
          try {
            logger.warn("[v0] Processing sejour:", sejour.title?.rendered || "Unknown")

            if (!sejour.acf) {
              logger.warn("[v0] Sejour has no ACF data:", sejour.id)
              return sejour
            }

            if (sejour.acf?.hebergements?.hebergements && Array.isArray(sejour.acf.hebergements.hebergements)) {
              try {
                sejour.acf.hebergements.hebergements = await Promise.all(
                  sejour.acf.hebergements.hebergements.map(async (urlOrItem: any) => {
                    try {
                      // If it's a string URL, extract slug and fetch
                      if (typeof urlOrItem === "string") {
                        const slug = extractSlugFromUrl(urlOrItem)
                        if (slug) {
                          const fullHebergement = await this.getPostBySlug("hebergement", slug)
                          if (fullHebergement) {
                            logger.warn(
                              "[v0] Fetched hebergement from URL:",
                              fullHebergement.title?.rendered || "Unknown",
                              fullHebergement.slug,
                            )
                            return { hebergement: fullHebergement }
                          }
                        }
                      }
                      // If it's already an object with ID
                      else if (urlOrItem?.hebergement?.ID) {
                        const fullHebergement = await this.getPostById("hebergement", urlOrItem.hebergement.ID)
                        logger.warn(
                          "[v0] Fetched hebergement from ID:",
                          fullHebergement.title?.rendered || "Unknown",
                          fullHebergement.slug,
                        )
                        return { hebergement: fullHebergement }
                      }
                    } catch (error) {
                      logger.error(
                        "[v0] Error fetching hebergement, skipping:",
                        error instanceof Error ? error.message : error,
                      )
                      // Return null for failed items so they can be filtered out
                      return null
                    }
                    return urlOrItem
                  }),
                )
                // Filter out null values from failed fetches
                sejour.acf.hebergements.hebergements = sejour.acf.hebergements.hebergements.filter(
                  (item) => item !== null,
                )
              } catch (error) {
                logger.error(
                  "[v0] Error processing hebergements array:",
                  error instanceof Error ? error.message : error,
                )
                // Keep original data if processing fails
              }
            }

            if (sejour.acf?.activites?.activite && Array.isArray(sejour.acf.activites.activite)) {
              try {
                sejour.acf.activites.activite = await Promise.all(
                  sejour.acf.activites.activite.map(async (urlOrItem: any) => {
                    try {
                      // If it's a string URL, extract slug and fetch
                      if (typeof urlOrItem === "string") {
                        const slug = extractSlugFromUrl(urlOrItem)
                        if (slug) {
                          const fullActivite = await this.getPostBySlug("activite", slug)
                          if (fullActivite) {
                            logger.warn(
                              "[v0] Fetched activite from URL:",
                              fullActivite.title?.rendered || "Unknown",
                              fullActivite.slug,
                            )
                            return { activite: fullActivite }
                          }
                        }
                      }
                      // If it's already an object with ID
                      else if (urlOrItem?.activite?.ID) {
                        const fullActivite = await this.getPostById("activite", urlOrItem.activite.ID)
                        logger.warn(
                          "[v0] Fetched activite from ID:",
                          fullActivite.title?.rendered || "Unknown",
                          fullActivite.slug,
                        )
                        return { activite: fullActivite }
                      }
                    } catch (error) {
                      logger.error(
                        "[v0] Error fetching activite, skipping:",
                        error instanceof Error ? error.message : error,
                      )
                      // Return null for failed items so they can be filtered out
                      return null
                    }
                    return urlOrItem
                  }),
                )
                // Filter out null values from failed fetches
                sejour.acf.activites.activite = sejour.acf.activites.activite.filter((item) => item !== null)
              } catch (error) {
                logger.error("[v0] Error processing activites array:", error instanceof Error ? error.message : error)
                // Keep original data if processing fails
              }
            }

            return sejour
          } catch (error) {
            logger.error("[v0] Error processing sejour:", sejour.id, error instanceof Error ? error.message : error)
            return sejour
          }
        }),
      )

      logger.warn("[v0] Sejours with complete data:", sejoursWithCompleteData.length)
      return sejoursWithCompleteData
    } catch (error) {
      logger.error("[v0] Error in getSejours():", error instanceof Error ? error.message : error)
      return []
    }
  }

  async getHebergements() {
    logger.warn("[v0] WordPress API - getHebergements() called")
    const result = await this.getPosts("hebergement")
    logger.warn("[v0] WordPress API - getHebergements() result count:", result.length)
    return result
  }

  async getActivites() {
    logger.warn("[v0] WordPress API - getActivites() method called - START")

    try {
      const activites = await this.getPosts("activite")
      logger.warn("[v0] WordPress API - getActivites() returned:", activites.length, "activités")

      if (activites.length > 0) {
        logger.warn("[v0] First activité full data:", JSON.stringify(activites[0], null, 2))
        logger.warn("[v0] First activité title:", activites[0].title?.rendered)
        logger.warn("[v0] First activité ACF:", JSON.stringify(activites[0].acf, null, 2))

        if (activites[0].acf) {
          logger.warn("[v0] Activité nom:", activites[0].acf.nom)
          logger.warn("[v0] Activité descriptif:", activites[0].acf.descriptif)
        } else {
          logger.warn("[v0] WARNING: No ACF data found for activité")
        }
      } else {
        logger.warn("[v0] WARNING: No activités found in WordPress")
      }

      return activites
    } catch (error) {
      logger.error("[v0] ERROR: Failed to fetch activités from WordPress API:", error)
      logger.error("[v0] This usually means the CPT 'activite' is not registered or not exposed in REST API")
      logger.error("[v0] Please check WordPress CPT configuration: show_in_rest should be true")
      return []
    }
  }

  async getEvenements() {
    return this.getPosts("evenement", { orderby: "date", order: "desc" })
  }

  async getPartenaires() {
    return this.getPosts("partenaire")
  }

  async getStructures() {
    const structures = await this.getPosts("structure")

    return structures.map((structure) => ({
      ...structure,
      featured_media_url: structure._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }))
  }

  async getEspacesDeTravail() {
    logger.warn("[v0] WordPress API - getEspacesDeTravail() called")
    return this.getPosts("espace-de-travail")
  }

  async getMapPinPoints() {
    logger.warn("[v0] getMapPinPoints() - START")

    try {
      const structures = await this.getStructures()
      await new Promise((resolve) => setTimeout(resolve, 100))

      const hebergements = await this.getHebergements()
      await new Promise((resolve) => setTimeout(resolve, 100))

      const espacesDeTravail = await this.getEspacesDeTravail()

      const allPosts = [...structures, ...hebergements, ...espacesDeTravail]

      const pinPoints = allPosts
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

          const shortDescription = post.acf?.descriptif
            ? post.acf.descriptif.replace(/<[^>]*>/g, "").substring(0, 100)
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

      logger.warn("[v0] Filtered visible pin points:", pinPoints.length)
      return pinPoints
    } catch (error) {
      logger.error("[v0] ERROR fetching map pin points:", error)
      return []
    }
  }

  async getHomepage(): Promise<WPPage> {
    return this.getPageById(138) // Homepage ID from ACF export
  }

  async getGlobalOptions(): Promise<GlobalOptionsACF> {
    logger.warn("[v0] WordPress API - getGlobalOptions() called")

    try {
      const data = await this.fetch<any>("/options-globales", {
        acf_format: "standard",
      })

      const optimizeImageData = (img: any) => {
        if (!img) return img
        return {
          url: img.sizes?.thumbnail || img.url,
          alt: img.alt || "",
          width: img.sizes?.["thumbnail-width"] || img.width,
          height: img.sizes?.["thumbnail-height"] || img.height,
        }
      }

      return {
        lien_du_cta_de_barre_superieure: data.menu?.lien_du_cta_de_barre_superieure || {
          title: "Réserver",
          url: "/contact",
          target: "",
        },
        miniature_du_megamenu: {
          titre_cta_1: data.menu?.miniature_du_megamenu?.titre_cta_1 || "Découvrir le lieu",
          lien_cta_1: data.menu?.miniature_du_megamenu?.lien_cta_1 || {
            title: "Découvrir le lieu",
            url: "/visite-virtuelle",
            target: "",
          },
          titre_cta_2: data.menu?.miniature_du_megamenu?.titre_cta_2,
          lien_cta_2: data.menu?.miniature_du_megamenu?.lien_cta_2,
          image: optimizeImageData(data.menu?.miniature_du_megamenu?.image),
        },
      }
    } catch (error) {
      logger.error("[v0] ERROR fetching global options:", error instanceof Error ? error.message : error)

      return {
        lien_du_cta_de_barre_superieure: {
          title: "Réserver",
          url: "/contact",
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
            url: "/rural-retreat-hermitage-building-nature.jpg",
            alt: "Vue de l'Hermitage",
          },
        },
      }
    }
  }

  async getMenu(menuSlug = "menu-1"): Promise<WPMenuItem[]> {
    logger.warn(`[v0] Fetching WordPress menu: ${menuSlug}`)

    try {
      // Try custom endpoint first
      const customUrl = `${this.wpJsonBase}/custom/v1/menu/${menuSlug}`
      logger.warn(`[v0] Trying custom menu endpoint: ${customUrl}`)

      const response = await fetch(customUrl, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      })

      if (response.ok) {
        const data = await response.json()
        logger.warn(`[v0] Successfully fetched menu from custom endpoint`)
        logger.warn(`[v0] Menu data:`, JSON.stringify(data, null, 2))
        return decodeObjectEntities(data)
      } else {
        logger.error(`[v0] Custom menu endpoint failed with status: ${response.status}`)
      }
    } catch (error) {
      logger.error(`[v0] Error fetching menu:`, error)
    }

    // Return empty array as fallback
    logger.warn(`[v0] Returning empty menu array`)
    return []
  }

  async getTaxonomyTerms(taxonomy: string): Promise<WPTerm[]> {
    logger.warn(`[v0] Fetching terms for taxonomy: ${taxonomy}`)
    return this.fetch<WPTerm[]>(`/${taxonomy}`, {
      per_page: 100,
      hide_empty: true,
    })
  }

  async getTeamMembers() {
    logger.warn("[v0] WordPress API - getTeamMembers() called")
    try {
      const membres = await this.getPosts<TeamMemberACF>("membre", {
        per_page: 100,
        orderby: "date",
        order: "asc", // Changed order from "desc" to "asc"
      })
      logger.warn("[v0] WordPress API - getTeamMembers() returned:", membres.length, "membres")
      return membres
    } catch (error) {
      logger.error("[v0] Error fetching team members:", error)
      return []
    }
  }
}

export const wpApi = new WordPressAPI()
