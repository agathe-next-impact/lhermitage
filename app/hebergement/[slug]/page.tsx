import { notFound } from 'next/navigation'
import { cache } from "react"
import type { Metadata } from "next"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
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

  const title = hebergement.acf?.nom || hebergement.title.rendered
  const featuredImage = hebergement.acf?.photos?.[0]?.url
    || hebergement._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    || "/rural-accommodation-rooms.jpg"

  return (
    <div>
      <PageHeader title={title} image={featuredImage} />
      <BentoHeaderContent>
        <div className="container mx-auto px-4 py-12">
          {/* Infos pratiques */}
          {(hebergement.acf?.capacite_daccueil != null || hebergement.acf?.repartition_des_chambres || hebergement.acf?.disponibilite || hebergement.acf?.commodites) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {hebergement.acf.capacite_daccueil != null && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Capacité d&apos;accueil</p>
                  <p className="text-lg font-semibold text-stone-800">{hebergement.acf.capacite_daccueil} personnes</p>
                </div>
              )}
              {hebergement.acf.repartition_des_chambres && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Chambres</p>
                  <p className="text-lg font-semibold text-stone-800">{hebergement.acf.repartition_des_chambres}</p>
                </div>
              )}
              {hebergement.acf.disponibilite && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Disponibilité</p>
                  <p className="text-lg font-semibold text-stone-800">{hebergement.acf.disponibilite}</p>
                </div>
              )}
              {hebergement.acf.commodites && (
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Commodités</p>
                  <p className="text-lg font-semibold text-stone-800">{hebergement.acf.commodites}</p>
                </div>
              )}
            </div>
          )}

          {hebergement.acf?.descriptif && (
            <div
              className="prose prose-stone mb-8 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(hebergement.acf.descriptif) }}
            />
          )}

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
      </BentoHeaderContent>
    </div>
  )
}
