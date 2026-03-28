import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { ActivitiesClient } from "@/components/features/activites/activities-client"
import { extractImagesFromHtml } from "@/lib/page-renderers/transforms/html-images"
import { extractCategories } from "@/lib/page-renderers/transforms/category-extraction"
import type { WPPage, WPPost, ActiviteACF } from "@/lib/wordpress/types"

interface Props {
  page: WPPage
  extra: { activites: WPPost<ActiviteACF>[] }
}

export default function ActivitesRenderer({ page, extra }: Props) {
  const { activites } = extra

  const categories = extractCategories(activites, "Découvrez nos activités de type ")

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
    <div className="container mx-auto md:pl-2 md:py-2">
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
          </p>
        </div>
      ) : (
        <ActivitiesClient categories={categories} activities={activitiesData} />
      )}
    </div>
  )
}
