import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { EspacesClient } from "./espaces-client"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.listing

/** Extract <img> src/alt from HTML content */
function extractImagesFromHtml(html: string): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const altMatch = match[0].match(/alt=["']([^"']*)["']/)
    images.push({ src: match[1], alt: altMatch?.[1] || "" })
  }
  return images
}

export default async function EspacesDeTravailPage() {
  const [page, espaces] = await Promise.all([
    wpApi.getPageByPath("sejours-collectifs/espaces-de-travail"),
    wpApi.getEspacesDeTravail(),
  ])

  const espacesData = espaces.map((espace) => {
    const photos = espace.acf?.photos || espace.acf?.images || []
    return {
      id: espace.id,
      title: espace.acf?.nom || espace.title.rendered,
      description: espace.acf?.descriptif ? stripHtml(espace.acf.descriptif) : undefined,
      descriptionHtml: espace.acf?.descriptif,
      image: photos[0]?.url || espace._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      imageAlt: photos[0]?.alt || espace._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || espace.title.rendered,
      slug: espace.slug,
      contentImages: espace.acf?.descriptif
        ? extractImagesFromHtml(espace.acf.descriptif)
        : [],
    }
  })

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Espaces de travail"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto md:pl-2 md:py-2">
          {page?.content.rendered && (
            <div
              className="prose prose-stone mb-12 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}

          {espaces.length === 0 ? (
            <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">Aucun espace de travail trouvé</h3>
              <p className="text-muted-foreground">
                Les espaces de travail n&apos;ont pas pu être chargés depuis WordPress.
              </p>
            </div>
          ) : (
            <EspacesClient espaces={espacesData} />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
