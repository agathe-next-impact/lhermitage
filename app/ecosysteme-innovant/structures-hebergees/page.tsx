import { HeroCard } from "@/components/hero-card"
import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { StructuresGrid } from "@/components/structures-grid"
import type { Metadata } from "next"

export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const page = await wpApi.getPageBySlug("structures-hebergees")
  
  return {
    title: page?.title.rendered || "Structures Hébergées",
    description: page?.acf?.hero?.["sous-titre"] || "Découvrez nos structures hébergées",
  }
}

export default async function StructuresPage() {
  const [page, structures] = await Promise.all([wpApi.getPageBySlug("structures-hebergees"), wpApi.getStructures()])

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
