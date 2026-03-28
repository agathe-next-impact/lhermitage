import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { WPPage } from "@/lib/wordpress/types"
import { RecrutementPage } from "@/components/features/recrutement/recrutement-page"

export default function RecrutementRenderer({ page }: { page: WPPage }) {
  const recrutementAcf = page.acf?.recrutement
  return (
    <div className="relative z-10 mx-auto">
      {page.content.rendered && (
        <div
          className="prose prose-stone max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
        />
      )}
      {recrutementAcf && <RecrutementPage acf={recrutementAcf} />}
    </div>
  )
}
