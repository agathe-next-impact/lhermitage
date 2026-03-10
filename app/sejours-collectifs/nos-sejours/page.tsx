import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { REVALIDATION } from "@/lib/constants"

const SeminairesPage = dynamic(() =>
  import("@/components/seminaires-page").then((m) => m.SeminairesPage)
)

export const revalidate = REVALIDATION.listing

export default async function NosSejoursPage() {
  const [page, seminairesData] = await Promise.all([
    wpApi.getPageByPath("sejours-collectifs/nos-sejours"),
    wpApi.getSeminairesData("sejours-collectifs/nos-sejours"),
  ])

  // Séminaires ACF data found → render full SeminairesPage component
  if (seminairesData) {
    return <SeminairesPage acf={seminairesData} />
  }

  // Fallback: render standard WordPress page content
  if (!page) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        title={page.title.rendered || "Nos Séjours"}
        subtitle={page.acf?.hero?.["sous-titre"]}
        image={page.acf?.hero?.image?.url || "/group-retreat-activities.jpg"}
      />
      <BentoHeaderContent title={page.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto px-4 py-16">
          {page.content?.rendered && (
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
