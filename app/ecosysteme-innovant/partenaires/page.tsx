import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { PartenairesClient } from "@/components/partenaires-client"

export default async function PartenairesPage() {
  const [page, partenaires, categories] = await Promise.all([
    wpApi.getPageByPath("ecosysteme-innovant/partenaires"),
    wpApi.getPartenaires(),
    wpApi.getTaxonomyTerms("type-de-partenaire"),
  ])

  // const midPoint = Math.ceil(partenaires.length / 2)
  // const innerCirclePartners = partenaires.slice(0, midPoint)
  // const outerCirclePartners = partenaires.slice(midPoint)

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Partenaires"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="p-2">
          {page?.content.rendered && (
            <div className="container px-4 mb-12">
              <div
                className="prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
              />
            </div>
          )}

          <PartenairesClient partenaires={partenaires} categories={categories} />
        </div>
      </BentoHeaderContent>
    </div>
  )
}
