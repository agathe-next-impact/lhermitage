import { notFound } from 'next/navigation'
import { cache } from "react"
import type { Metadata } from "next"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { PhotoGallery, VideoSection, LocationSection, ContactCta } from "@/components/content/detail-page-sections"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export const revalidate = REVALIDATION.detail

const getHebergement = cache((slug: string) =>
  wpApi.getHebergementBySlug(slug)
)

interface HebergementPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: HebergementPageProps): Promise<Metadata> {
  const { slug } = await params
  const hebergement = await getHebergement(slug)

  if (!hebergement) {
    return { title: "Hébergement non trouvé" }
  }

  const title = hebergement.acf?.nom || hebergement.title?.rendered || "Hébergement"
  const description = hebergement.acf?.descriptif
    ? stripHtml(hebergement.acf.descriptif).substring(0, 160)
    : "Découvrez cet hébergement à L'Hermitage"
  const image = hebergement.acf?.photos?.[0]?.url
    || hebergement._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    || "/rural-retreat-hermitage-building-nature.jpg"

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export async function generateStaticParams() {
  const hebergements = await wpApi.getHebergements()
  return hebergements.map((hebergement) => ({
    slug: hebergement.slug,
  }))
}

export default async function HebergementPage({ params }: HebergementPageProps) {
  const { slug } = await params
  const hebergement = await getHebergement(slug)

  if (!hebergement) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-4xl font-extrabold uppercase md:text-5xl">
          {hebergement.acf?.nom || hebergement.title.rendered}
        </h1>

        {hebergement.acf?.descriptif && (
          <div
            className="prose prose-stone mb-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(hebergement.acf.descriptif) }}
          />
        )}
      </div>

      {hebergement.acf?.photos && hebergement.acf.photos.length > 0 && (
        <PhotoGallery photos={hebergement.acf.photos} />
      )}

      {hebergement.acf?.video && <VideoSection video={hebergement.acf.video} />}

      {hebergement.acf?.localisation && <LocationSection localisation={hebergement.acf.localisation} />}

      <ContactCta
        title="Intéressé par cet hébergement ?"
        description="Contactez-nous pour vérifier les disponibilités"
      />
    </div>
  )
}
