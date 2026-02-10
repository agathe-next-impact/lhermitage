import { PageHeader } from "@/components/layout/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { PartenairesClient } from "@/components/partenaires-client"

export default async function PartenairesPage() {
  const [page, partenaires, categories] = await Promise.all([
    wpApi.getPageBySlug("partenaires"),
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
        image={page?.acf?.hero?.image || "/placeholder.svg?key=9wv3x"}
      />

      <div className="py-12">
        {page?.content.rendered && (
          <div className="container mx-auto px-4 mb-12">
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }} />
          </div>
        )}

        <PartenairesClient partenaires={partenaires} categories={categories} />
      </div>
    </div>
  )
}
