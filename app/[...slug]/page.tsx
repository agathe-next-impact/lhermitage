import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import type { Metadata } from "next"
import { wpApi, getPageByPath } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import type { HistoireACF } from "@/lib/wordpress/types"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

// Code-split: ces composants lourds ne sont chargés que pour leur page spécifique
const ActivitesFilter = dynamic(() => import("@/components/activites-filter").then((m) => m.ActivitesFilter))
const HistoireTimeline = dynamic(() => import("@/components/histoire-timeline").then((m) => m.HistoireTimeline))
const TeamMasonry = dynamic(() => import("@/components/team-masonry").then((m) => m.TeamMasonry))
const DevenirSocietairePage = dynamic(() => import("@/components/features/devenir-societaire/devenir-societaire-page").then((m) => m.DevenirSocietairePage))

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
    const description = page.acf?.hero?.["sous-titre"] || 
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
    const pages = await wpApi.getPages({ per_page: 100 })



    const filteredPages = pages.filter((page) => {
      const wpBaseUrl = process.env.WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://admin.hermitagelelab.com"
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
      const wpBaseUrl = process.env.WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://admin.hermitagelelab.com"
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

  const isActivitesPage = fullPath.includes("activites")
  const isHistoirePage = fullPath === "tiers-lieu-rural/lhistoire-du-lieu"
  const isEquipePage = fullPath === "tiers-lieu-rural/lequipe"
  const isDevenirSocietairePage = fullPath === "participer/devenir-societaire"

  let page = null
  let activites: any[] = []
  let teamMembers: any[] = []

  try {
    const [fetchedPage, fetchedActivites, fetchedTeamMembers] = await Promise.all([
      getPageByPath(fullPath),
      isActivitesPage ? wpApi.getActivites() : Promise.resolve([]),
      isEquipePage ? wpApi.getTeamMembers() : Promise.resolve([]),
    ])
    page = fetchedPage
    activites = fetchedActivites
    teamMembers = fetchedTeamMembers
  } catch (error) {
    notFound()
  }

  if (!page) {
    notFound()
  }


  return (
    <div>
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.hero?.["sous-titre"]}
        image={page.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      {isHistoirePage && page.acf ? (
        <div className="relative z-10"><HistoireTimeline acf={page.acf as HistoireACF} /></div>
      ) : isEquipePage ? (
        <div className="relative z-10 container mx-auto px-4 py-2">
          {page.content.rendered && (
            <div
              className="prose prose-stone max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
          <TeamMasonry members={teamMembers} />
        </div>
      ) : isDevenirSocietairePage ? (
        <div className="relative z-10"><DevenirSocietairePage page={page} /></div>
      ) : (
        <div className="relative z-10 container mx-auto px-4 py-2">
          {page.content.rendered && (
            <div
              className="prose prose-stone max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}

          {isActivitesPage && (
            <>
              {activites.length === 0 ? (
                <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">Aucune activité trouvée</h3>
                  <p className="text-muted-foreground">
                    Les activités n'ont pas pu être chargées depuis WordPress.
                    <br />
                    Vérifiez que le Custom Post Type "activite" est bien configuré avec "show_in_rest: true".
                  </p>
                </div>
              ) : (
                <ActivitesFilter activites={activites} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
