import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"

export default async function ServicesPage() {
  const page = await wpApi.getPageBySlug("services")

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Services"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/placeholder.svg?key=5pq8r"}
      />

      <div className="container mx-auto px-4 py-12">
        {page?.content.rendered && (
          <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        )}
      </div>
    </div>
  )
}
