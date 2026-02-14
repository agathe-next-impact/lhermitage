import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { HebergementsGrid } from "@/components/hebergements-grid"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export const revalidate = REVALIDATION.listing

export default async function HebergementsPage() {
  const [page, hebergements] = await Promise.all([wpApi.getPageBySlug("hebergements"), wpApi.getHebergements()])

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Hébergements"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-accommodation-rooms.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto pl-2 py-2">
          {page?.content.rendered && (
            <div
              className="prose prose-stone mb-12 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}

          {hebergements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Aucun hébergement trouvé pour le moment.</p>
            </div>
          )}

          <HebergementsGrid hebergements={hebergements} />
        </div>
      </BentoHeaderContent>
    </div>
  )
}
