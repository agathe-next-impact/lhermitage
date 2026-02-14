import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import type { Metadata } from "next"
import type React from "react"
import { wpApi, getPageByPath } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import type { HistoireACF, TeamMemberACF, WPPost } from "@/lib/wordpress/types"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

// Code-split: ces composants lourds ne sont chargés que pour leur page spécifique
const HistoireTimeline = dynamic(() =>
  import("@/components/histoire-timeline").then((m) => m.HistoireTimeline)
)
const TeamMasonry = dynamic(() => import("@/components/team-masonry").then((m) => m.TeamMasonry))
const DevenirSocietairePage = dynamic(() =>
  import("@/components/features/devenir-societaire/devenir-societaire-page").then(
    (m) => m.DevenirSocietairePage
  )
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

      // Exclude empty paths and dedicated pages
      if (pagePath === "") return false
      if (pagePath === "hebergements") return false
      if (pagePath === "sejours-collectifs/packs-de-sejours") return false
      if (pagePath === "sejours-collectifs/nos-sejours") return false
      if (pagePath === "ecosysteme-innovant/partenaires") return false

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
  const isDevenirSocietairePage = fullPath === "participer/devenir-societaire"

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
    content = <div className="relative z-10"><HistoireTimeline acf={page.acf as HistoireACF} /></div>
  } else if (isEquipePage) {
    content = (
      <div className="relative z-10 mx-auto px-4 py-2">
        {page.content.rendered && (
          <div
            className="prose prose-stone max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        )}
        <TeamMasonry members={teamMembers} />
      </div>
    )
  } else if (isDevenirSocietairePage) {
    content = <div className="relative z-10"><DevenirSocietairePage page={page} /></div>
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
      {content}
    </div>
  )
}
