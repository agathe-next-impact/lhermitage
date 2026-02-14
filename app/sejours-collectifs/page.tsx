import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export const revalidate = REVALIDATION.listing

export default async function SejoursCollectifsPage() {
  const page = await wpApi.getPageBySlug("sejours-collectifs")

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Séjours Collectifs"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/group-retreat-activities.jpg"}
        color={getColorForPath("/sejours-collectifs")}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto px-4 py-16">
          {page?.content.rendered && (
            <div
              className="prose prose-stone mx-auto max-w-3xl"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
