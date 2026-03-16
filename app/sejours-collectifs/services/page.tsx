import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { REVALIDATION } from "@/lib/constants"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { ServicesClient } from "./services-client"

export const revalidate = REVALIDATION.listing

const TYPE_COLORS: Record<string, string> = {}
const PALETTE = [
  BRAND_COLORS.coral,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.darkBlue,
]

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

export default async function ServicesPage() {
  const [page, services] = await Promise.all([
    wpApi.getPageByPath("sejours-collectifs/services"),
    wpApi.getServices(),
  ])

  // Build categories from taxonomy terms (same pattern as activités)
  const categoriesMap = new Map()
  let colorIndex = 0
  services.forEach((service) => {
    const categoryData = service._embedded?.["wp:term"]?.[0]?.[0]
    if (categoryData) {
      if (!categoriesMap.has(categoryData.slug)) {
        // Assign a stable color per type
        if (!TYPE_COLORS[categoryData.slug]) {
          TYPE_COLORS[categoryData.slug] = PALETTE[colorIndex % PALETTE.length]
          colorIndex++
        }
        categoriesMap.set(categoryData.slug, {
          id: categoryData.id.toString(),
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || `Découvrez nos ${categoryData.name.toLowerCase()}`,
          color: TYPE_COLORS[categoryData.slug],
          displayOrder: categoryData.display_order ?? 0,
        })
      }
    }
  })

  const categories = Array.from(categoriesMap.values()).sort(
    (a, b) => a.displayOrder - b.displayOrder
  )

  const servicesData = services.map((service) => {
    const categoryInfo = service._embedded?.["wp:term"]?.[0]?.[0]
    return {
      id: service.id,
      title: service.acf?.nom || service.title.rendered,
      description: service.acf?.descriptif ? stripHtml(service.acf.descriptif) : undefined,
      descriptionHtml: service.acf?.descriptif,
      image: service.acf?.photos?.[0]?.url || service._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      imageAlt: service.acf?.photos?.[0]?.alt || service._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || service.title.rendered,
      slug: service.slug,
      categoryName: categoryInfo?.name,
      categorySlug: categoryInfo?.slug,
      contentImages: service.acf?.descriptif
        ? extractImagesFromHtml(service.acf.descriptif)
        : [],
    }
  })

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Services"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto pl-2 py-2">
          {page?.content.rendered && (
            <div
              className="prose prose-stone mb-12 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}

          {services.length === 0 ? (
            <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">Aucun service trouvé</h3>
              <p className="text-muted-foreground">
                Les services n&apos;ont pas pu être chargés depuis WordPress.
              </p>
            </div>
          ) : (
            <ServicesClient categories={categories} services={servicesData} />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
