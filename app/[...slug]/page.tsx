import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/page-header"
import { ActivitesFilter } from "@/components/activites-filter"
import { HistoireTimeline } from "@/components/histoire-timeline"
import { TeamMasonry } from "@/components/team-masonry"
import { DevenirSocietairePage } from "@/components/devenir-societaire-page"
import type { HistoireACF } from "@/lib/wordpress/types"

export const revalidate = 3600 // Revalidate every hour

interface PageProps {
  params: Promise<{ slug: string[] }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const fullPath = slug.join("/")
  
  try {
    const page = await wpApi.getPageByPath(fullPath)
    
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
      const wpBaseUrl = process.env.NEXT_PUBLIC_WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://wp-asso.com"
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
      const wpBaseUrl = process.env.NEXT_PUBLIC_WP_API_URL?.replace("/wp-json/wp/v2", "") || "https://wp-asso.com"
      const pagePath = page.link.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, "")
      const slugArray = pagePath.split("/").filter(Boolean)

      return {
        slug: slugArray,
      }
    })
  } catch (error) {
    console.error("[v0] Error in generateStaticParams:", error)
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
      wpApi.getPageByPath(fullPath),
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
        image={page.acf?.hero?.image || "/rural-retreat-landscape.jpg"}
      />

      {isHistoirePage && page.acf ? (
        <HistoireTimeline acf={page.acf as HistoireACF} />
      ) : isEquipePage ? (
        <div className="container mx-auto px-4 py-12">
          {page.content.rendered && (
            <div
              className="prose prose-stone max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
          )}
          <TeamMasonry members={teamMembers} />
        </div>
      ) : isDevenirSocietairePage ? (
        <DevenirSocietairePage page={page} />
      ) : (
        <div className="container mx-auto px-4 py-12">
          {page.content.rendered && (
            <div
              className="prose prose-stone max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
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
