import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { HebergementsGrid } from "@/components/hebergements-grid"

export default async function HebergementsPage() {
  console.warn("[v0] HebergementsPage - Starting to fetch data")

  const [page, hebergements] = await Promise.all([wpApi.getPageBySlug("hebergements"), wpApi.getHebergements()])

  console.warn("[v0] HebergementsPage - Page fetched:", page?.title.rendered)
  console.warn("[v0] HebergementsPage - Hebergements count:", hebergements?.length || 0)
  console.warn("[v0] HebergementsPage - Hebergements data:", JSON.stringify(hebergements, null, 2))

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Hébergements"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/rural-accommodation-rooms.jpg"}
      />

      <div className="container mx-auto px-4 py-12">
        {page?.content.rendered && (
          <div
            className="prose prose-stone mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        )}

        {hebergements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Aucun hébergement trouvé pour le moment.</p>
          </div>
        )}

        <HebergementsGrid hebergements={hebergements} />
      </div>
    </div>
  )
}
