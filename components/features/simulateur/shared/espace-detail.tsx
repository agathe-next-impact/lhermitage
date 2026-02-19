"use client"

import Image from "next/image"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EspaceDetailProps {
  slug: string
}

function formatSlugFallback(slug: string): string {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function EspaceDetail({ slug }: EspaceDetailProps) {
  const { espaces, settings } = useSimulateurData()
  const espace = espaces.find((e) => e.slug === slug)

  const getEquipementLabel = (eq: string) =>
    settings.equipements_disponibles?.find((e) => e.slug === eq)?.label ?? formatSlugFallback(eq)

  const getAmbianceLabel = (amb: string) =>
    settings.ambiances_disponibles?.find((a) => a.slug === amb)?.label ?? formatSlugFallback(amb)

  if (!espace) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Espace introuvable</p>
        <p className="text-sm mt-1">Aucun espace ne correspond au slug &quot;{slug}&quot;.</p>
      </div>
    )
  }

  const { acf } = espace
  const description = acf.description_immersive || acf.descriptif

  return (
    <div className="overflow-hidden">
      {/* Featured image */}
      {espace.featuredImage && (
        <div className="relative w-full h-48 md:h-64 overflow-hidden">
          <Image
            src={espace.featuredImage.url}
            alt={espace.featuredImage.alt || espace.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-heading uppercase font-extrabold text-2xl text-[#2A4A51]">
            {acf.nom || espace.title}
          </h2>

          {acf.ambiance && (
            <div className="mt-2">
              <Badge variant="secondary" className="rounded-full">
                {getAmbianceLabel(acf.ambiance)}
              </Badge>
            </div>
          )}
        </div>

        {/* Description */}
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}

        {/* Key info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {acf.capacite_max && (
            <InfoCard label="Capacite" value={`${acf.capacite_max} pers. max`} />
          )}
          {acf.superficie_m2 && <InfoCard label="Superficie" value={`${acf.superficie_m2} m²`} />}
          {acf.privatisable && acf.prix_privatisation_journee && (
            <InfoCard label="Privatisation" value={`${acf.prix_privatisation_journee} € / jour`} />
          )}
        </div>

        {/* Equipements */}
        {acf.equipements && acf.equipements.length > 0 && (
          <div>
            <h3 className="font-heading uppercase text-xs tracking-wider text-muted-foreground font-bold mb-3">
              Equipements
            </h3>
            <div className="flex flex-wrap gap-2">
              {acf.equipements.map((eq) => (
                <Badge key={eq} variant="outline" className="rounded-full">
                  {getEquipementLabel(eq)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {acf.galerie && acf.galerie.length > 0 && (
          <div>
            <h3 className="font-heading uppercase text-xs tracking-wider text-muted-foreground font-bold mb-3">
              Galerie
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {acf.galerie.map((img, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${espace.title} - photo ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="192px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vue 360 */}
        {acf.vue_360_url && (
          <div>
            <a
              href={acf.vue_360_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-coral hover:text-brand-coral/80 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              Visite virtuelle 360
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  const isPrice = label.toLowerCase() === "privatisation"
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="font-heading uppercase text-xs tracking-wider text-muted-foreground font-bold">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold mt-0.5",
          isPrice ? "text-[#E75754] font-extrabold text-lg" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}
