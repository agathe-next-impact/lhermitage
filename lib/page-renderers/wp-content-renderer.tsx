import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { WPPage } from "@/lib/wordpress/types"

export default function WpContentRenderer({ page }: { page: WPPage }) {
  return (
    <div className="relative z-10 mx-auto px-4 py-2">
      {page.content.rendered && (
        <div
          className="prose prose-stone max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
        />
      )}
    </div>
  )
}
