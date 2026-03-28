import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { PartenairesClient } from "@/components/partenaires-client"
import type { WPPage, WPPost, WPTerm } from "@/lib/wordpress/types"

interface Props {
  page: WPPage
  extra: {
    partenaires: WPPost<any>[]
    categories: WPTerm[]
  }
}

export default function PartenairesRenderer({ page, extra }: Props) {
  return (
    <div className="md:p-2">
      {page?.content.rendered && (
        <div className="container px-4 mb-12">
          <div
            className="prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        </div>
      )}

      <PartenairesClient partenaires={extra.partenaires} categories={extra.categories} />
    </div>
  )
}
