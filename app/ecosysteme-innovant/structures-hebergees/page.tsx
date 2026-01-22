import { HeroCard } from "@/components/hero-card"
import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { StructuresGrid } from "@/components/structures-grid"

export const revalidate = 900

export default async function StructuresPage() {
  const [page, structures] = await Promise.all([wpApi.getPageBySlug("structures-hebergees"), wpApi.getStructures()])

  // Debug to ensure ACF data is present on structures
  // (Will only log in dev because logger is dev-only)
  if (structures.length === 0) {
    console.warn("[StructuresPage] No structures returned from WP")
  } else {
    const s = structures[0]
    console.warn("[StructuresPage] First structure keys", Object.keys(s))
    console.warn("[StructuresPage] Has ACF", !!s.acf, "ACF keys", s.acf ? Object.keys(s.acf) : [])
  }

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Structures Hébergées"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/placeholder.svg?key=6st9u"}
      />

      <div className="container mx-auto px-4 py-12">
        {page?.content.rendered && (
          <div
            className="prose prose-stone mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        )}

        <StructuresGrid structures={structures} />
      </div>
    </div>
  )
}
