import { notFound } from 'next/navigation'
import { cache } from "react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { PhotoGallery, VideoSection, LocationSection, ContactCta } from "@/components/content/detail-page-sections"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml, sanitizeUrl } from "@/lib/wordpress/sanitize"

const getStructure = cache((slug: string) =>
  wpApi.getStructureBySlug(slug)
)

interface StructurePageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = REVALIDATION.frequent

export async function generateMetadata({ params }: StructurePageProps): Promise<Metadata> {
  const { slug } = await params
  const structure = await getStructure(slug)

  if (!structure) {
    return { title: "Structure non trouvée" }
  }

  const title = structure.acf?.nom || structure.title?.rendered || "Structure hébergée"
  const description = structure.acf?.descriptif
    ? stripHtml(structure.acf.descriptif).substring(0, 160)
    : "Découvrez cette structure hébergée à L'Hermitage"
  const image = structure.acf?.photos?.[0]?.url
    || structure._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    || "/rural-retreat-hermitage-building-nature.jpg"

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export async function generateStaticParams() {
  const structures = await wpApi.getStructures()
  return structures.map((structure) => ({
    slug: structure.slug,
  }))
}

export default async function StructurePage({ params }: StructurePageProps) {
  const { slug } = await params
  const structure = await getStructure(slug)

  if (!structure) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-4xl font-extrabold uppercase md:text-5xl">
          {structure.acf?.nom || structure.title.rendered}
        </h1>

        {structure.acf?.descriptif && (
          <div
            className="prose prose-stone mb-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(structure.acf.descriptif) }}
          />
        )}

        {structure.acf?.lien && (
          <Button asChild size="lg" className="mb-8">
            <a href={sanitizeUrl(structure.acf.lien.url)} target="_blank" rel="noopener noreferrer">
              {structure.acf.lien.title || "Visiter le site"}
            </a>
          </Button>
        )}
      </div>

      {structure.acf?.photos && structure.acf.photos.length > 0 && (
        <PhotoGallery photos={structure.acf.photos} />
      )}

      {structure.acf?.video && <VideoSection video={structure.acf.video} />}

      {structure.acf?.localisation && <LocationSection localisation={structure.acf.localisation} />}

      <ContactCta
        title="Intéressé par cette structure ?"
        description="Contactez-nous pour en savoir plus"
      />
    </div>
  )
}
