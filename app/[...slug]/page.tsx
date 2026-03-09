import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import type { Metadata } from "next"
import type React from "react"
import { wpApi, getPageByPath } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import type { HistoireACF, TeamMemberACF, PatrimoineACF, WPPost } from "@/lib/wordpress/types"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

// Code-split: ces composants lourds ne sont chargés que pour leur page spécifique
const HistoireTimeline = dynamic(() =>
  import("@/components/histoire-timeline").then((m) => m.HistoireTimeline)
)
const TeamMasonry = dynamic(() => import("@/components/team-masonry").then((m) => m.TeamMasonry))
const PatrimoinePage = dynamic(() =>
  import("@/components/patrimoine-page").then((m) => m.PatrimoinePage)
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
    const pages = await wpApi.getPages()

    const filteredPages = pages.filter((page) => {
      const wpBaseUrl =
        process.env.WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://admin.hermitagelelab.com"
      const pagePath = page.link.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, "")

      // Exclude paths that have dedicated page.tsx routes —
      // otherwise the catch-all SSG overwrites them with generic WordPress content
      const dedicatedRoutes = [
        "hebergements",
        "sejours-collectifs",
        "sejours-collectifs/activites",
        "sejours-collectifs/nos-sejours",
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
      ]

      if (!pagePath || dedicatedRoutes.includes(pagePath)) return false

      return true
    })

    return filteredPages.map((page) => {
      const wpBaseUrl =
        process.env.WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://admin.hermitagelelab.com"
      const pagePath = page.link.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, "")
      const slugArray = pagePath.split("/").filter(Boolean)

      return {
        slug: slugArray,
      }
    })
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
  let page = null
  let teamMembers: WPPost<TeamMemberACF>[] = []

  try {
    const [fetchedPage, fetchedTeamMembers] = await Promise.all([
      getPageByPath(fullPath),
      isEquipePage ? wpApi.getTeamMembers() : Promise.resolve([]),
    ])
    page = fetchedPage
    teamMembers = fetchedTeamMembers
  } catch (error) {
    notFound()
  }

  if (!page) {
    notFound()
  }

  let content: React.ReactNode = null

  if (isHistoirePage && page.acf) {
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
  } else if (page.acf?.patrimoine?.sections && page.acf.patrimoine.sections.length > 0) {
    content = (
      <div className="relative z-10">
        <PatrimoinePage acf={page.acf.patrimoine as PatrimoineACF} />
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

  return (
    <div>
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.hero?.["sous-titre"]}
        image={page.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />
      <BentoHeaderContent title={page.acf?.hero?.["sous-titre"]}>{content}</BentoHeaderContent>
    </div>
  )
}
