import { HeroCard } from "@/components/features/home/hero-card"
import { PageHeader } from "@/components/layout/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { StructuresGrid } from "@/components/structures-grid"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export const revalidate = REVALIDATION.frequent

export default async function StructuresPage() {
  const [page, structures] = await Promise.all([wpApi.getPageBySlug("structures-hebergees"), wpApi.getStructures()])

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Structures Hébergées"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {page?.content.rendered && (
          <div
            className="prose prose-stone mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        )}

        <StructuresGrid structures={structures} />
      </div>
    </div>
  )
}
