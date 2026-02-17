"use client"

import Image from "next/image"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ActiviteDetailProps {
  slug: string
}

const NIVEAU_PHYSIQUE_LABELS: Record<string, string> = {
  faible: "Faible",
  modere: "Modere",
  intense: "Intense",
}

const LIEU_LABELS: Record<string, string> = {
  interieur: "Interieur",
  exterieur: "Exterieur",
  les_deux: "Interieur & Exterieur",
}

function formatPrice(activite: {
  acf: { mode_tarification?: string; prix_par_personne?: number; prix_forfaitaire?: number }
}): string {
  if (activite.acf.mode_tarification === "forfaitaire" && activite.acf.prix_forfaitaire) {
    return `${activite.acf.prix_forfaitaire} \u20ac forfait`
  }
  if (activite.acf.prix_par_personne) {
    return `${activite.acf.prix_par_personne} \u20ac / pers.`
  }
  return "Sur devis"
}

function formatDuration(minutes?: number): string {
  if (!minutes) return ""
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins.toString().padStart(2, "0")}`
}

export function ActiviteDetail({ slug }: ActiviteDetailProps) {
  const { activites } = useSimulateurData()
  const activite = activites.find((a) => a.slug === slug)

  if (!activite) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Activite introuvable</p>
        <p className="text-sm mt-1">Aucune activite ne correspond au slug &quot;{slug}&quot;.</p>
      </div>
    )
  }

  const { acf } = activite
  const description = acf.description_immersive || acf.descriptif

  return (
    <div className="overflow-hidden">
      {/* Featured image */}
      {activite.featuredImage && (
        <div className="relative w-full h-48 md:h-64 overflow-hidden">
          <Image
            src={activite.featuredImage.url}
            alt={activite.featuredImage.alt || activite.title}
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
            {acf.nom || activite.title}
          </h2>

          {/* Types / Tags */}
          {activite.types && activite.types.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activite.types.map((type) => (
                <Badge key={type.slug} variant="secondary" className="rounded-full">
                  {type.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}

        {/* Key info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {acf.duree_minutes && (
            <InfoCard label="Duree" value={formatDuration(acf.duree_minutes)} />
          )}
          {(acf.capacite_min || acf.capacite_max) && (
            <InfoCard
              label="Capacite"
              value={
                acf.capacite_min && acf.capacite_max
                  ? `${acf.capacite_min} - ${acf.capacite_max} pers.`
                  : acf.capacite_max
                    ? `Max. ${acf.capacite_max} pers.`
                    : `Min. ${acf.capacite_min} pers.`
              }
            />
          )}
          <InfoCard label="Tarif" value={formatPrice(activite)} />
          {acf.niveau_physique && (
            <InfoCard
              label="Niveau physique"
              value={NIVEAU_PHYSIQUE_LABELS[acf.niveau_physique] || acf.niveau_physique}
            />
          )}
          {acf.interieur_exterieur && (
            <InfoCard
              label="Lieu"
              value={LIEU_LABELS[acf.interieur_exterieur] || acf.interieur_exterieur}
            />
          )}
        </div>

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
                    alt={img.alt || `${activite.title} - photo ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="192px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video teaser */}
        {acf.video_teaser_url && (
          <div>
            <a
              href={acf.video_teaser_url}
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
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Voir la video teaser
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  const isPrice = label.toLowerCase() === "tarif"
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
