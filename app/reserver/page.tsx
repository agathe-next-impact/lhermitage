import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { ContactForm } from "./contact-form"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { Metadata } from "next"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Réserver — L'Hermitage",
  description: "Réservez votre séjour, événement ou collaboration à L'Hermitage, tiers-lieu rural.",
}

export default async function ReserverPage() {
  const page = await wpApi.getPageBySlug("reserver")

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Réserver"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
        color={getColorForPath("/reserver")}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"] || "Parlons de votre projet"}>
        <div className="container mx-auto p-2">
          {page?.content.rendered && (
            <div
              className="prose prose-stone max-w-2xl mx-auto mb-12"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
          <ContactForm />
        </div>
      </BentoHeaderContent>
    </div>
  )
}
