import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { EvenementsClient } from "./evenements-client"
import { REVALIDATION } from "@/lib/constants"
import { getCategoryColorByIndex } from "@/lib/wordpress/category-colors"

export const revalidate = REVALIDATION.frequent

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

/** Parse a date string and return { monthKey, monthLabel } */
function extractMonth(dateStr?: string): { monthKey: string; monthLabel: string } | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    const month = d.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, "0")}`
    const label = `${MONTH_NAMES[month]} ${year}`
    return { monthKey: key, monthLabel: label }
  } catch {
    return null
  }
}

export default async function EvenementsPage() {
  const [page, evenements] = await Promise.all([
    wpApi.getPageByPath("ecosysteme-innovant/evenements"),
    wpApi.getEvenements(),
  ])

  // Extract categories from taxonomy terms
  const categoriesMap = new Map()
  evenements.forEach((evt) => {
    const categoryData = evt._embedded?.["wp:term"]?.[0]?.[0]
    if (categoryData) {
      if (!categoriesMap.has(categoryData.slug)) {
        categoriesMap.set(categoryData.slug, {
          id: categoryData.id.toString(),
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || `Événements ${categoryData.name}`,
        })
      }
    }
  })

  const categories = Array.from(categoriesMap.values()).map((cat, index) => ({
    ...cat,
    color: getCategoryColorByIndex(index),
  }))

  // Transform events for client component
  const evenementsData = evenements.map((evt) => {
    const categoryInfo = evt._embedded?.["wp:term"]?.[0]?.[0]
    const monthInfo = extractMonth(evt.acf?.eventDateStart)

    return {
      id: evt.id,
      title: evt.title.rendered,
      description: evt.acf?.eventPitch ? stripHtml(evt.acf.eventPitch) : undefined,
      descriptionHtml: evt.acf?.eventPitch,
      image: evt._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      imageAlt: evt._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || evt.title.rendered,
      slug: evt.slug,
      categoryName: categoryInfo?.name,
      categorySlug: categoryInfo?.slug,
      dateDeDebut: evt.acf?.eventDateStart,
      dateDeFin: evt.acf?.eventDateEnd,
      dateLabel: evt.acf?.eventDateLabel,
      venueLabel: evt.acf?.eventVenueLabel,
      accessType: evt.acf?.eventAccessType,
      eventIcon: evt.acf?.eventIcon,
      eventColorAccent: evt.acf?.eventColorAccent,
      monthKey: monthInfo?.monthKey,
      monthLabel: monthInfo?.monthLabel,
    }
  })

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Événements"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto md:pl-2 md:py-2">
          {page?.content.rendered && (
            <div
              className="prose prose-stone mb-12 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}

          {evenements.length === 0 ? (
            <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">Aucun événement trouvé</h3>
              <p className="text-muted-foreground">
                Les événements n&apos;ont pas pu être chargés depuis WordPress.
              </p>
            </div>
          ) : (
            <EvenementsClient categories={categories} evenements={evenementsData} />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
