import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { StructuresGrid } from "@/components/structures-grid"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.frequent

export default async function StructuresPage() {
  const [page, structures] = await Promise.all([
    wpApi.getPageByPath("ecosysteme-innovant/structures"),
    wpApi.getStructures(),
  ])

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "L'écosystème innovant"}
        subtitle={page?.acf?.hero?.["sous-titre"] || "Découvrez nos structures"}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />
      <StructuresGrid
        structures={structures}
        sectionInternes={page?.acf?.page_structures?.structures_internes}
        sectionHebergees={page?.acf?.page_structures?.structures_hebergees}
      />
    </div>
  )
}
