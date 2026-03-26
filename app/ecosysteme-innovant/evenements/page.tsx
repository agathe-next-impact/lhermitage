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

/** Lowercase French month names → 0-based index */
const FR_MONTH_INDEX: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11, decembre: 11,
}

/** Parse an ISO date string and return { monthKey, monthLabel } */
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

/**
 * Parse a French free-text date label like "Vendredi 20 mars à 19h"
 * and extract { monthKey, monthLabel, sortDay }.
 * Falls back to null if no month name is found.
 */
function extractMonthFromLabel(label?: string): {
  monthKey: string
  monthLabel: string
  sortDay: number
} | null {
  if (!label) return null
  const lower = label.toLowerCase()
  for (const [name, idx] of Object.entries(FR_MONTH_INDEX)) {
    if (lower.includes(name)) {
      // Extract day number that precedes the month name (e.g. "20 mars")
      const dayMatch = lower.match(new RegExp(`(\\d{1,2})\\s+${name}`))
      const day = dayMatch ? parseInt(dayMatch[1], 10) : 1
      // Infer year: current year, or next year if month is in the past
      const now = new Date()
      let year = now.getFullYear()
      const candidateDate = new Date(year, idx, day)
      if (candidateDate.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
        year += 1
      }
      const key = `${year}-${String(idx + 1).padStart(2, "0")}`
      return { monthKey: key, monthLabel: `${MONTH_NAMES[idx]} ${year}`, sortDay: day }
    }
  }
  return null
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

  // Transform events for client component, sorted by date (closest first)
  const evenementsData = evenements
    .map((evt) => {
      const categoryInfo = evt._embedded?.["wp:term"]?.[0]?.[0]
      // Try ISO date first (eventDateStart), fall back to parsing the French label
      const monthFromIso = extractMonth(evt.acf?.eventDateStart)
      const monthFromLabel = extractMonthFromLabel(evt.acf?.eventDateLabel)
      const monthInfo = monthFromIso || monthFromLabel

      // Build a sortable timestamp: ISO date > reconstructed date from label > Infinity
      let sortTimestamp = Infinity
      if (evt.acf?.eventDateStart) {
        sortTimestamp = new Date(evt.acf.eventDateStart).getTime()
      } else if (monthFromLabel) {
        const [y, m] = monthFromLabel.monthKey.split("-").map(Number)
        sortTimestamp = new Date(y, m - 1, monthFromLabel.sortDay).getTime()
      }

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
        sortTimestamp,
      }
    })
    .sort((a, b) => a.sortTimestamp - b.sortTimestamp)

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
