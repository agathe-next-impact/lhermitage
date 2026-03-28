import { PageHeader } from "@/components/layout/page-header"
import { StructuresGrid } from "@/components/structures-grid"
import type { WPPage, WPPost, StructureACF } from "@/lib/wordpress/types"

interface Props {
  page: WPPage
  extra: { structures: WPPost<StructureACF>[] }
}

export default function StructuresRenderer({ page, extra }: Props) {
  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "L'écosystème innovant"}
        subtitle={page?.acf?.hero?.["sous-titre"] || "Découvrez nos structures"}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />
      <StructuresGrid
        structures={extra.structures}
        sectionInternes={page?.acf?.page_structures?.structures_internes}
        sectionHebergees={page?.acf?.page_structures?.structures_hebergees}
      />
    </div>
  )
}
