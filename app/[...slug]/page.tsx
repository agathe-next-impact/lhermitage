import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { wpApi, getPageByPath, getElementsDePageHero } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { getRouteConfig, isSeminairesPage } from "@/lib/page-registry"

// --- Renderers (dynamic imports for code splitting) ---
import WpContentRenderer from "@/lib/page-renderers/wp-content-renderer"
import ReserverRenderer from "@/lib/page-renderers/reserver-renderer"
import RecrutementRenderer from "@/lib/page-renderers/recrutement-renderer"
import DevenirSocietaireRenderer from "@/lib/page-renderers/devenir-societaire-renderer"
import NousSoutenirRenderer from "@/lib/page-renderers/nous-soutenir-renderer"
import ContactsRenderer from "@/lib/page-renderers/contacts-renderer"
import HorairesRenderer from "@/lib/page-renderers/horaires-renderer"
import HebergementsRenderer from "@/lib/page-renderers/hebergements-renderer"
import SejoursIndividuelsRenderer from "@/lib/page-renderers/sejours-individuels-renderer"
import ActivitesRenderer from "@/lib/page-renderers/activites-renderer"
import EspacesRenderer from "@/lib/page-renderers/espaces-renderer"
import ServicesRenderer from "@/lib/page-renderers/services-renderer"
import StructuresRenderer from "@/lib/page-renderers/structures-renderer"
import PartenairesRenderer from "@/lib/page-renderers/partenaires-renderer"
import EvenementsRenderer from "@/lib/page-renderers/evenements-renderer"
import LocalisationRenderer from "@/lib/page-renderers/localisation-renderer"
import NosSejoursRenderer from "@/lib/page-renderers/nos-sejours-renderer"
import PacksSejoursRenderer from "@/lib/page-renderers/packs-sejours-renderer"
import HistoireRenderer from "@/lib/page-renderers/histoire-renderer"
import EquipeRenderer from "@/lib/page-renderers/equipe-renderer"
import DomaineRenderer from "@/lib/page-renderers/domaine-renderer"
import PatrimoineRenderer from "@/lib/page-renderers/patrimoine-renderer"
import SeminairesRenderer from "@/lib/page-renderers/seminaires-renderer"

// Revalidation: 15min (most frequent page type) — covers all page types
export const revalidate = REVALIDATION.frequent

// Map renderer keys to components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RENDERERS: Record<string, React.ComponentType<any>> = {
  wpContent: WpContentRenderer,
  reserver: ReserverRenderer,
  recrutement: RecrutementRenderer,
  devenirSocietaire: DevenirSocietaireRenderer,
  nousSoutenir: NousSoutenirRenderer,
  contacts: ContactsRenderer,
  horaires: HorairesRenderer,
  hebergements: HebergementsRenderer,
  sejoursIndividuels: SejoursIndividuelsRenderer,
  activites: ActivitesRenderer,
  espaces: EspacesRenderer,
  services: ServicesRenderer,
  structures: StructuresRenderer,
  partenaires: PartenairesRenderer,
  evenements: EvenementsRenderer,
  localisation: LocalisationRenderer,
  nosSejours: NosSejoursRenderer,
  packsSejours: PacksSejoursRenderer,
  histoire: HistoireRenderer,
  equipe: EquipeRenderer,
  domaine: DomaineRenderer,
  patrimoine: PatrimoineRenderer,
  seminaires: SeminairesRenderer,
}

interface PageProps {
  params: Promise<{ slug: string[] }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const fullPath = slug.join("/")

  try {
    // Both calls are wrapped in React `cache()` and dedupe with the page render below.
    const [page, elementsHero] = await Promise.all([
      getPageByPath(fullPath),
      getElementsDePageHero(fullPath),
    ])

    if (!page) {
      return { title: "Page non trouvée" }
    }

    const title =
      elementsHero?.titre || page.acf?.hero?.titre || page.title?.rendered || "L'Hermitage"
    const description =
      elementsHero?.["sous-titre"] ||
      page.acf?.hero?.["sous-titre"] ||
      page.excerpt?.rendered?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      "Découvrez L'Hermitage, tiers-lieu rural dédié aux séjours et hébergements"
    const image =
      elementsHero?.image?.url ||
      page.acf?.hero?.image?.url ||
      "/rural-retreat-hermitage-building-nature.jpg"

    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: image }], type: "website" },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    }
  } catch {
    return {
      title: "L'Hermitage",
      description: "Tiers-lieu rural dédié aux séjours et hébergements",
    }
  }
}

export async function generateStaticParams() {
  try {
    const pages = await wpApi.getPagePaths()
    const wpBaseUrl =
      process.env.WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://admin.hermitagelelab.com"

    return pages
      .map((page) => page.link.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, ""))
      .filter((pagePath) => pagePath)
      .map((pagePath) => ({
        slug: pagePath.split("/").filter(Boolean),
      }))
  } catch (error) {
    console.error("Error in generateStaticParams:", error)
    return []
  }
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params
  const fullPath = slug.join("/")

  // 1. Look up page registry
  const config = getRouteConfig(fullPath)

  // 2. Fetch page + extra data + legacy "Elements de page" hero in parallel.
  //    The elementsDePage hero is fetched via an isolated query that fails
  //    silently if the ACF field group is not yet exposed on the Page type
  //    (see lib/wordpress/graphql/queries/elements-de-page.ts). When it
  //    returns data, we merge it into `page.acf.hero` so every render path
  //    (registry, default, seminaires) picks it up transparently.
  let page
  let extra: Record<string, unknown> = {}
  let elementsHero: Awaited<ReturnType<typeof getElementsDePageHero>> = null

  try {
    const [fetchedPage, fetchedExtra, fetchedElementsHero] = await Promise.all([
      getPageByPath(fullPath),
      config?.fetchExtra ? config.fetchExtra(wpApi, fullPath) : Promise.resolve({}),
      getElementsDePageHero(fullPath),
    ])
    page = fetchedPage
    extra = fetchedExtra
    elementsHero = fetchedElementsHero
  } catch {
    notFound()
  }

  // Merge elementsDePage hero into page.acf.hero (overrides featured-image
  // fallback set by transformPage when an explicit ACF image is provided).
  if (page && elementsHero) {
    const mergedHero = { ...(page.acf?.hero || {}) }
    if (elementsHero.titre) mergedHero.titre = elementsHero.titre
    if (elementsHero["sous-titre"]) mergedHero["sous-titre"] = elementsHero["sous-titre"]
    if (elementsHero.image) mergedHero.image = elementsHero.image
    page = { ...page, acf: { ...(page.acf || {}), hero: mergedHero } }
  }

  // 3. Handle seminaires pages (prefix-matched, not in registry)
  if (!config && isSeminairesPage(fullPath) && page) {
    const seminairesData = await wpApi.getSeminairesData(fullPath)
    if (seminairesData) {
      const heroTitle =
        seminairesData.hero_seminaires?.accroche ||
        page.acf?.hero?.titre ||
        page.title.rendered
      const heroSubtitle =
        seminairesData.hero_seminaires?.sous_titre || page.acf?.hero?.["sous-titre"]
      const heroImage =
        seminairesData.hero_seminaires?.image?.url ||
        page.acf?.hero?.image?.url ||
        "/rural-retreat-landscape.jpg"

      return (
        <div>
          <PageHeader title={heroTitle} subtitle={heroSubtitle} image={heroImage} />
          <BentoHeaderContent title={heroSubtitle} lateralImages={page.acf?.hero?.images_laterales}>
            <SeminairesRenderer extra={{ seminairesData }} />
          </BentoHeaderContent>
        </div>
      )
    }
  }

  if (!page) {
    notFound()
  }

  // 4. Render via registry
  if (config) {
    const Renderer = RENDERERS[config.renderer]
    if (!Renderer) {
      console.error(`No renderer found for key: ${config.renderer}`)
      notFound()
    }

    // customLayout: renderer controls its own layout (includes PageHeader etc.)
    if (config.customLayout) {
      return <Renderer page={page} extra={extra} />
    }

    // Standard layout: PageHeader + BentoHeaderContent wrapper
    // Optional getHeader() in the registry can override title/subtitle/image
    // from the resolved `extra` payload (e.g. ACF hero fields).
    const headerOverride = config.getHeader?.(page, extra) ?? {}
    const headerTitle = headerOverride.title || page.acf?.hero?.titre || page.title.rendered
    const headerSubtitle = headerOverride.subtitle || page.acf?.hero?.["sous-titre"]
    const headerImage =
      headerOverride.image || page.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"

    return (
      <div>
        <PageHeader title={headerTitle} subtitle={headerSubtitle} image={headerImage} />
        <BentoHeaderContent
          title={headerSubtitle}
          lateralImages={page.acf?.hero?.images_laterales}
        >
          <Renderer page={page} extra={extra} />
        </BentoHeaderContent>
      </div>
    )
  }

  // 5. Default: render WP content (pages not in registry)
  const heroTitle = page.acf?.hero?.titre || page.title.rendered
  const heroSubtitle = page.acf?.hero?.["sous-titre"]
  const heroImage = page.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"

  return (
    <div>
      <PageHeader title={heroTitle} subtitle={heroSubtitle} image={heroImage} />
      <BentoHeaderContent
        title={heroSubtitle}
        lateralImages={page.acf?.hero?.images_laterales}
      >
        <div className="relative z-10 mx-auto px-4 py-2">
          {page.content.rendered && (
            <div
              className="prose prose-stone max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
