import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { ActivitiesClient } from "./activities-client"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.listing

/** Extract <img> src/alt from HTML content */
function extractImagesFromHtml(html: string): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const altMatch = match[0].match(/alt=["']([^"']*)["']/)
    images.push({ src: match[1], alt: altMatch?.[1] || "" })
  }
  return images
}

function getCategoryColor(slug: string): string {
  const colorMap: Record<string, string> = {
    "atelier-de-facilitation": "#C14C66",
    "zero-dechets": "#78AD7D",
    "prendre-lair": "#56939F",
    festivite: "#DC6F45",
    "decouverte-du-site": "#2A4A51",
  }
  return colorMap[slug] || "#E75754"
}

export default async function ActivitesPage() {
  const [page, activites] = await Promise.all([
    wpApi.getPageByPath("sejours-collectifs/activites"),
    wpApi.getActivites(),
  ])

  const categoriesMap = new Map()
  activites.forEach((activite) => {
    const categoryData = activite._embedded?.["wp:term"]?.[0]?.[0]
    if (categoryData) {
      if (!categoriesMap.has(categoryData.slug)) {
        categoriesMap.set(categoryData.slug, {
          id: categoryData.id.toString(),
          name: categoryData.name,
          slug: categoryData.slug,
          description:
            categoryData.description || `Découvrez nos activités de type ${categoryData.name}`,
          color: getCategoryColor(categoryData.slug),
          displayOrder: categoryData.display_order ?? 0,
        })
      }
    }
  })

  const categories = Array.from(categoriesMap.values()).sort((a, b) => a.displayOrder - b.displayOrder)

  const activitiesData = activites.map((activite) => {
    const categoryInfo = activite._embedded?.["wp:term"]?.[0]?.[0]
    return {
      id: activite.id,
      title: activite.acf?.nom || activite.title.rendered,
      description: activite.acf?.descriptif ? stripHtml(activite.acf.descriptif) : undefined,
      descriptionHtml: activite.acf?.descriptif,
      image: activite._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      imageAlt: activite._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || activite.title.rendered,
      slug: activite.slug,
      categoryName: categoryInfo?.name,
      categorySlug: categoryInfo?.slug,
      contentImages: activite.acf?.descriptif
        ? extractImagesFromHtml(activite.acf.descriptif)
        : [],
    }
  })

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Activités"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/diverse-outdoor-activities.png"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto pl-2 py-2">
          {page?.content.rendered && (
            <div
              className="prose prose-stone mb-12 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}

          {activites.length === 0 ? (
            <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">Aucune activité trouvée</h3>
              <p className="text-muted-foreground">
                Les activités n&apos;ont pas pu être chargées depuis WordPress.
                <br />
                Vérifiez que le Custom Post Type &quot;activite&quot; est bien configuré avec
                &quot;show_in_rest: true&quot;.
                {process.env.NODE_ENV === "development" && (
                  <>
                    <br />
                    <br />
                    URL de l&apos;API testée: {process.env.WP_API_URL}/activite
                  </>
                )}
              </p>
            </div>
          ) : (
            <ActivitiesClient categories={categories} activities={activitiesData} />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
