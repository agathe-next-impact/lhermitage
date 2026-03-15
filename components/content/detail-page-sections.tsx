import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { WPImage, WPGoogleMap } from "@/lib/wordpress/types"
import { sanitizeVideoEmbed } from "@/lib/wordpress/sanitize"

interface PhotoGalleryProps {
  photos: WPImage[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Photos</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <div key={`photo-${photo.id ?? index}`} className="relative h-64 overflow-hidden rounded-lg">
            <Image
              src={photo.url || "/placeholder.svg"}
              alt={photo.alt || `Photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={80}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

interface VideoSectionProps {
  video: string
}

export function VideoSection({ video }: VideoSectionProps) {
  const safeVideo = sanitizeVideoEmbed(video)
  if (!safeVideo) return null

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Video</h2>
      <div className="aspect-video overflow-hidden rounded-lg">
        <div dangerouslySetInnerHTML={{ __html: safeVideo }} />
      </div>
    </section>
  )
}

interface LocationSectionProps {
  localisation: WPGoogleMap
}

export function LocationSection({ localisation }: LocationSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Localisation</h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Coordonnees GPS</p>
              <p className="text-sm text-muted-foreground">Latitude: {localisation.lat}</p>
              <p className="text-sm text-muted-foreground">Longitude: {localisation.lng}</p>
              {localisation.address && (
                <p className="mt-2 text-sm">{localisation.address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

interface ContactCtaProps {
  title: string
  description: string
}

export function ContactCta({ title, description }: ContactCtaProps) {
  return (
    <section className="rounded-lg bg-muted p-8 text-center">
      <h2 className="mb-4 font-serif text-2xl font-bold">{title}</h2>
      <p className="mb-6 text-muted-foreground">{description}</p>
      <Button asChild size="lg">
        <Link href="/infos-pratiques/contacts">Nous contacter</Link>
      </Button>
    </section>
  )
}
