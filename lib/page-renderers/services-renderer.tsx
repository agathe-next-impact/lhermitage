import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { ServicesClient } from "@/components/features/services/services-client"
import { extractImagesFromHtml } from "@/lib/page-renderers/transforms/html-images"
import type { WPPage, WPPost, ServiceACF } from "@/lib/wordpress/types"

const TYPE_COLORS: Record<string, string> = {}
const PALETTE = [
  BRAND_COLORS.coral,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.darkBlue,
]

interface Props {
  page: WPPage
  extra: { services: WPPost<ServiceACF>[] }
}

export default function ServicesRenderer({ page, extra }: Props) {
  const { services } = extra

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
          description:
            categoryData.description || `Découvrez nos ${categoryData.name.toLowerCase()}`,
          color: TYPE_COLORS[categoryData.slug],
          displayOrder: categoryData.display_order ?? 0,
        })
      }
    }
  })

  const categories = Array.from(categoriesMap.values()).sort(
    (a: any, b: any) => a.displayOrder - b.displayOrder
  )

  const servicesData = services.map((service) => {
    const categoryInfo = service._embedded?.["wp:term"]?.[0]?.[0]
    return {
      id: service.id,
      title: service.acf?.nom || service.title.rendered,
      description: service.acf?.descriptif ? stripHtml(service.acf.descriptif) : undefined,
      descriptionHtml: service.acf?.descriptif,
      image:
        service.acf?.photos?.[0]?.url ||
        service._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      imageAlt:
        service.acf?.photos?.[0]?.alt ||
        service._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
        service.title.rendered,
      slug: service.slug,
      categoryName: categoryInfo?.name,
      categorySlug: categoryInfo?.slug,
      contentImages: service.acf?.descriptif
        ? extractImagesFromHtml(service.acf.descriptif)
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
  )
}
