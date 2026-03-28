import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { EvenementsClient } from "@/components/features/evenements/evenements-client"
import { extractMonth, extractMonthFromLabel } from "@/lib/page-renderers/transforms/event-dates"
import { extractCategories } from "@/lib/page-renderers/transforms/category-extraction"
import type { WPPage, WPPost, EvenementACF } from "@/lib/wordpress/types"

interface Props {
  page: WPPage
  extra: { evenements: WPPost<EvenementACF>[] }
}

export default function EvenementsRenderer({ page, extra }: Props) {
  const { evenements } = extra

  // Extract categories from taxonomy terms
  const categories = extractCategories(evenements, "Événements ")

  // Transform events for client component, sorted by date (closest first)
  const evenementsData = evenements
    .map((evt) => {
      const categoryInfo = evt._embedded?.["wp:term"]?.[0]?.[0]
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
  )
}
