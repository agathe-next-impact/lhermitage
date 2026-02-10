import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export const revalidate = REVALIDATION.detail

const getSejour = cache((slug: string) =>
  wpApi.getSejourBySlug(slug)
)

interface SejourPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SejourPageProps): Promise<Metadata> {
  const { slug } = await params
  const sejour = await getSejour(slug)

  if (!sejour) {
    return { title: "Séjour non trouvé" }
  }

  const title = sejour.acf?.nom || sejour.title?.rendered || "Séjour"
  const description = sejour.content?.rendered
    ? stripHtml(sejour.content.rendered).substring(0, 160)
    : "Découvrez ce séjour à L'Hermitage"
  const image = sejour._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    || "/rural-retreat-hermitage-building-nature.jpg"

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export async function generateStaticParams() {
  const sejours = await wpApi.getSejours()
  return sejours.map((sejour) => ({
    slug: sejour.slug,
  }))
}

export default async function SejourPage({ params }: SejourPageProps) {
  const { slug } = await params
  const sejour = await getSejour(slug)

  if (!sejour) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-4xl font-extrabold uppercase md:text-5xl">
          {sejour.acf?.nom || sejour.title?.rendered || "Séjour"}
        </h1>
        {sejour.content?.rendered && (
          <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(sejour.content.rendered) }} />
        )}
      </div>

      {/* Hébergements Section */}
      {sejour.acf?.hebergements?.hebergements && sejour.acf.hebergements.hebergements.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">
            {sejour.acf.hebergements.titre || "Hébergements"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sejour.acf.hebergements.hebergements.map((item, index) => {
              const hebergement = item.hebergement
              if (!hebergement) return null

              const featuredMedia = hebergement._embedded?.["wp:featuredmedia"]?.[0]
              const imageUrl = featuredMedia?.source_url
              const imageAlt =
                featuredMedia?.alt_text || hebergement.title?.rendered || hebergement.acf?.nom || "Image hébergement"

              return (
                <Card key={hebergement.id || index} className="overflow-hidden">
                  {imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image src={imageUrl || "/placeholder.svg"} alt={imageAlt} fill className="object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{hebergement.acf?.nom || hebergement.title?.rendered || "Hébergement"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hebergement.slug && (
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <Link href={`/hebergement/${hebergement.slug}`}>Voir détails</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Activités Section */}
      {sejour.acf?.activites?.activite && sejour.acf.activites.activite.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">
            {sejour.acf.activites.titre || "Activités"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sejour.acf.activites.activite.map((item, index) => {
              const activite = item.activite
              if (!activite) return null

              const featuredMedia = activite._embedded?.["wp:featuredmedia"]?.[0]
              const imageUrl = featuredMedia?.source_url
              const imageAlt = featuredMedia?.alt_text || activite.title?.rendered || "Image activité"

              return (
                <Card key={activite.id || index} className="overflow-hidden">
                  {imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image src={imageUrl || "/placeholder.svg"} alt={imageAlt} fill className="object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{activite.title?.rendered || "Activité"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activite.slug && (
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <Link href={`/activite/${activite.slug}`}>En savoir plus</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="rounded-lg bg-muted p-8 text-center">
        <h2 className="mb-4 font-serif text-2xl font-bold">Intéressé par ce séjour ?</h2>
        <p className="mb-6 text-muted-foreground">
          Contactez-nous pour plus d'informations ou pour réserver votre séjour
        </p>
        <Button asChild size="lg">
          <Link href="/infos-pratiques/contacts">Nous contacter</Link>
        </Button>
      </section>
    </div>
  )
}
