import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export default async function ServicesPage() {
  const page = await wpApi.getPageBySlug("services")

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Services"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto px-4 py-12">
          {page?.content.rendered && (
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }} />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
