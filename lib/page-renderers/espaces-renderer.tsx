import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { stripHtml } from "@/lib/utils"
import { EspacesClient } from "@/components/features/espaces/espaces-client"
import { extractImagesFromHtml } from "@/lib/page-renderers/transforms/html-images"
import type { WPPage, WPPost } from "@/lib/wordpress/types"

interface EspaceDeTravailACF {
  nom?: string
  descriptif?: string
  photos?: Array<{ url: string; alt?: string }>
  images?: Array<{ url: string; alt?: string }>
}

interface Props {
  page: WPPage
  extra: { espaces: WPPost<EspaceDeTravailACF>[] }
}

export default function EspacesRenderer({ page, extra }: Props) {
  const { espaces } = extra

  const espacesData = espaces.map((espace) => {
    const photos = espace.acf?.photos || espace.acf?.images || []
    return {
      id: espace.id,
      title: espace.acf?.nom || espace.title.rendered,
      description: espace.acf?.descriptif ? stripHtml(espace.acf.descriptif) : undefined,
      descriptionHtml: espace.acf?.descriptif,
      image:
        photos[0]?.url || espace._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      imageAlt:
        photos[0]?.alt ||
        espace._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
        espace.title.rendered,
      slug: espace.slug,
      contentImages: espace.acf?.descriptif
        ? extractImagesFromHtml(espace.acf.descriptif)
        : [],
    }
  })

  return (
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
  )
}
