import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { WPPage, WPPost, HebergementACF } from "@/lib/wordpress/types"
import { HebergementsGrid } from "@/components/hebergements-grid"

interface Props {
  page: WPPage
  extra: { hebergements: WPPost<HebergementACF>[] }
}

export default function HebergementsRenderer({ page, extra }: Props) {
  return (
    <div className="container mx-auto md:pl-2 md:pt-2 md:py-0">
      {page?.content.rendered && (
        <div
          className="prose prose-stone mb-12 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
        />
      )}
      {extra.hebergements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Aucun hébergement trouvé pour le moment.</p>
        </div>
      )}
      <HebergementsGrid hebergements={extra.hebergements} />
    </div>
  )
}
