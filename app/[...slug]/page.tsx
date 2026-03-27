import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import type { Metadata } from "next"
import type React from "react"
import { wpApi, getPageByPath } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import type {
  HistoireACF,
  TeamMemberACF,
  PatrimoineACF,
  SeminairesACF,
  WPPost,
} from "@/lib/wordpress/types"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

// Routes with dedicated page.tsx files — excluded from catch-all SSG
const DEDICATED_ROUTES = [
  "hebergements",
  "reserver",
  "sejours-collectifs",
  "sejours-collectifs/activites",
  "sejours-collectifs/packs-de-sejours",
  "sejours-individuels",
  "ecosysteme-innovant/structures",
  "ecosysteme-innovant/partenaires",
  "ecosysteme-innovant/evenements",
  "services",
  "infos-pratiques/contacts",
  "infos-pratiques/jours-et-horaires-douverture",
  "infos-pratiques/localisation",
  "participer/devenir-societaire",
  "vous-engager/offres-demploi",
  "vous-engager/alternance",
  "vous-engager/stages",
  "vous-engager/services-civique",
  "vous-engager/pass-permis",
]

// Code-split: ces composants lourds ne sont chargés que pour leur page spécifique
const HistoireTimeline = dynamic(() =>
  import("@/components/histoire-timeline").then((m) => m.HistoireTimeline)
)
const TeamMasonry = dynamic(() => import("@/components/team-masonry").then((m) => m.TeamMasonry))
const PatrimoinePage = dynamic(() =>
  import("@/components/patrimoine-page").then((m) => m.PatrimoinePage)
)
const SeminairesPage = dynamic(() =>
  import("@/components/seminaires-page").then((m) => m.SeminairesPage)
)
export const revalidate = REVALIDATION.listing

interface PageProps {
  params: Promise<{ slug: string[] }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const fullPath = slug.join("/")

  try {
    const page = await getPageByPath(fullPath)

    if (!page) {
      return {
        title: "Page non trouvée",
      }
    }

    const title = page.title?.rendered || "L'Hermitage"
    const description =
      page.acf?.hero?.["sous-titre"] ||
      page.excerpt?.rendered?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      "Découvrez L'Hermitage, tiers-lieu rural dédié aux séjours et hébergements"
    const image = page.acf?.hero?.image?.url || "/rural-retreat-hermitage-building-nature.jpg"

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: image }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
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
    // Use lightweight query — only fetches link/slug, not full ACF fields
    const pages = await wpApi.getPagePaths()
    const wpBaseUrl =
      process.env.WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://admin.hermitagelelab.com"

    return pages
      .map((page) => page.link.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, ""))
      .filter((pagePath) => pagePath && !DEDICATED_ROUTES.includes(pagePath))
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

  const isHistoirePage = fullPath === "tiers-lieu-rural/lhistoire-du-lieu"
  const isEquipePage = fullPath === "tiers-lieu-rural/lequipe"
  const isSeminairesPage = fullPath.startsWith("seminaires")
  const isDomainePage = fullPath === "tiers-lieu-rural/le-domaine-de-l-hermitage"
  const isPatrimoinePage = fullPath === "tiers-lieu-rural/un-patrimoine-historique"
  let page = null
  let teamMembers: WPPost<TeamMemberACF>[] = []
  let seminairesData: SeminairesACF | null = null
  let patrimoineData: PatrimoineACF | null = null
  let domaineVideo: { url: string; mimeType: string; descriptif?: string } | null = null

  try {
    const [fetchedPage, fetchedTeamMembers, fetchedDomaineVideo, fetchedPatrimoine] =
      await Promise.all([
        getPageByPath(fullPath),
        isEquipePage ? wpApi.getTeamMembers() : Promise.resolve([]),
        isDomainePage
          ? wpApi.getPageVideo("tiers-lieu-rural/le-domaine-de-l-hermitage")
          : Promise.resolve(null),
        isPatrimoinePage ? wpApi.getPatrimoineData(fullPath) : Promise.resolve(null),
      ])
    page = fetchedPage
    teamMembers = fetchedTeamMembers
    domaineVideo = fetchedDomaineVideo
    patrimoineData = fetchedPatrimoine

    // Only fetch séminaires data for séminaires pages (avoids overriding patrimoine and other pages)
    if (page && isSeminairesPage) {
      seminairesData = await wpApi.getSeminairesData(fullPath)
    }
  } catch (error) {
    notFound()
  }

  if (!page) {
    notFound()
  }

  let content: React.ReactNode = null

  if (seminairesData) {
    content = (
      <div className="relative z-10">
        <SeminairesPage acf={seminairesData} />
      </div>
    )
  } else if (isHistoirePage && page.acf) {
    content = (
      <div className="relative z-10">
        <HistoireTimeline acf={page.acf as HistoireACF} />
      </div>
    )
  } else if (isEquipePage) {
    content = (
      <div className="relative z-10 mx-auto">
        {page.content.rendered && (
          <div
            className="prose prose-stone max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        )}
        <TeamMasonry members={teamMembers} />
      </div>
    )
  } else if (isDomainePage) {
    content = (
      <div className="relative z-10 mx-auto space-y-8">
        {domaineVideo && (
          <div className="container mx-auto md:p-2">
            <div className="overflow-hidden rounded-xl">
              <video
                src={domaineVideo.url}
                controls
                playsInline
                className="w-full"
                autoPlay
                muted
                loop
              >
                <source src={domaineVideo.url} type={domaineVideo.mimeType} />
              </video>
            </div>
          </div>
        )}
        {domaineVideo?.descriptif && (
          <div
            className="prose prose-stone max-w-none mb-6 md:px-4 md:py-2"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(domaineVideo.descriptif) }}
          />
        )}
      </div>
    )
  } else if (isPatrimoinePage && patrimoineData?.sections) {
    content = (
      <div className="relative z-10">
        <PatrimoinePage acf={patrimoineData} />
      </div>
    )
  } else {
    content = (
      <div className="relative z-10 mx-auto px-4 py-2">
        {page.content.rendered && (
          <div
            className="prose prose-stone max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        )}
      </div>
    )
  }

  const heroTitle = seminairesData?.hero_seminaires?.accroche || page.title.rendered
  const heroSubtitle = seminairesData?.hero_seminaires?.sous_titre || page.acf?.hero?.["sous-titre"]
  const heroImage =
    seminairesData?.hero_seminaires?.image?.url ||
    page.acf?.hero?.image?.url ||
    "/rural-retreat-landscape.jpg"
  const heroLateralImages = page.acf?.hero?.images_laterales

  return (
    <div>
      <PageHeader title={heroTitle} subtitle={heroSubtitle} image={heroImage} />
      <BentoHeaderContent title={heroSubtitle} lateralImages={heroLateralImages}>
        {content}
      </BentoHeaderContent>
    </div>
  )
}
