import Image from "next/image"
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { wpApi } from "@/lib/wordpress/api"
import type { HebergementACF } from "@/lib/wordpress/types"
import Link from "next/link"

interface HebergementPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const hebergements = await wpApi.getHebergements()
  return hebergements.map((hebergement) => ({
    slug: hebergement.slug,
  }))
}

export default async function HebergementPage({ params }: HebergementPageProps) {
  const { slug } = await params
  const hebergement = await wpApi.getPostBySlug<HebergementACF>("hebergement", slug)

  if (!hebergement) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-4xl font-extrabold uppercase md:text-5xl">
          {hebergement.acf?.nom || hebergement.title.rendered}
        </h1>

        {/* Description */}
        {hebergement.acf?.descriptif && (
          <div
            className="prose prose-stone mb-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: hebergement.acf.descriptif }}
          />
        )}
      </div>

      {/* Photo Gallery */}
      {hebergement.acf?.photos && Array.isArray(hebergement.acf.photos) && hebergement.acf.photos.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Photos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hebergement.acf.photos.map((photo, index) => (
              <div key={photo.id || index} className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.alt || `Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video */}
      {hebergement.acf?.video && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Vidéo</h2>
          <div className="aspect-video overflow-hidden rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: hebergement.acf.video }} />
          </div>
        </section>
      )}

      {/* Location Map */}
      {hebergement.acf?.localisation && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Localisation</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Coordonnées GPS</p>
                  <p className="text-sm text-muted-foreground">Latitude: {hebergement.acf.localisation.lat}</p>
                  <p className="text-sm text-muted-foreground">Longitude: {hebergement.acf.localisation.lng}</p>
                  {hebergement.acf.localisation.address && (
                    <p className="mt-2 text-sm">{hebergement.acf.localisation.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* CTA Section */}
      <section className="rounded-lg bg-muted p-8 text-center">
        <h2 className="mb-4 font-serif text-2xl font-bold">Intéressé par cet hébergement ?</h2>
        <p className="mb-6 text-muted-foreground">Contactez-nous pour vérifier les disponibilités</p>
        <Button asChild size="lg">
          <Link href="/infos-pratiques/contacts">Nous contacter</Link>
        </Button>
      </section>
    </div>
  )
}
