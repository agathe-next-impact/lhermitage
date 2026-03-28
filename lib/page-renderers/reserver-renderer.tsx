import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { WPPage } from "@/lib/wordpress/types"
import { ContactForm } from "@/components/features/contact/contact-form"

export default function ReserverRenderer({ page }: { page: WPPage }) {
  return (
    <div className="relative z-10 mx-auto">
      {page.content.rendered && (
        <div
          className="prose prose-stone max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
        />
      )}
      <div className="py-8">
        <ContactForm />
      </div>
    </div>
  )
}
