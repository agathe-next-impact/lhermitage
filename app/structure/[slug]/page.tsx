import Image from "next/image"
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { wpApi } from "@/lib/wordpress/api"
import type { StructureACF } from "@/lib/wordpress/types"
import Link from "next/link"

interface StructurePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const structures = await wpApi.getStructures()
  return structures.map((structure) => ({
    slug: structure.slug,
  }))
}

export default async function StructurePage({ params }: StructurePageProps) {
  const { slug } = await params
  const structure = await wpApi.getPostBySlug<StructureACF>("structure", slug)

  if (!structure) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-4xl font-extrabold uppercase md:text-5xl">
          {structure.acf?.nom || structure.title.rendered}
        </h1>

        {/* Description */}
        {structure.acf?.descriptif && (
          <div
            className="prose prose-stone mb-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: structure.acf.descriptif }}
          />
        )}

        {/* External Link */}
        {structure.acf?.lien && (
          <Button asChild size="lg" className="mb-8">
            <a href={structure.acf.lien.url} target="_blank" rel="noopener noreferrer">
              {structure.acf.lien.title || "Visiter le site"}
            </a>
          </Button>
        )}
      </div>

      {/* Photo Gallery */}
      {structure.acf?.photos && Array.isArray(structure.acf.photos) && structure.acf.photos.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Photos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {structure.acf.photos.map((photo, index) => (
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
      {structure.acf?.video && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Vidéo</h2>
          <div className="aspect-video overflow-hidden rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: structure.acf.video }} />
          </div>
        </section>
      )}

      {/* Location Map */}
      {structure.acf?.localisation && (
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Localisation</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Coordonnées GPS</p>
                  <p className="text-sm text-muted-foreground">Latitude: {structure.acf.localisation.lat}</p>
                  <p className="text-sm text-muted-foreground">Longitude: {structure.acf.localisation.lng}</p>
                  {structure.acf.localisation.address && (
                    <p className="mt-2 text-sm">{structure.acf.localisation.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* CTA Section */}
      <section className="rounded-lg bg-muted p-8 text-center">
        <h2 className="mb-4 font-serif text-2xl font-bold">Intéressé par cette structure ?</h2>
        <p className="mb-6 text-muted-foreground">Contactez-nous pour en savoir plus</p>
        <Button asChild size="lg">
          <Link href="/infos-pratiques/contacts">Nous contacter</Link>
        </Button>
      </section>
    </div>
  )
}
