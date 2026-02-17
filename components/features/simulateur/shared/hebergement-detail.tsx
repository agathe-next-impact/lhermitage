"use client"

import Image from "next/image"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HebergementDetailProps {
  slug: string
}

const CONFORT_LABELS: Record<string, string> = {
  standard: "Standard",
  confort: "Confort",
  premium: "Premium",
}

const CONFORT_COLORS: Record<string, string> = {
  standard: "rounded-full bg-gray-100 text-gray-600",
  confort: "rounded-full bg-[#56939F]/10 text-[#56939F]",
  premium: "rounded-full bg-[#E75754]/10 text-[#E75754]",
}

function formatEquipement(slug: string): string {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function HebergementDetail({ slug }: HebergementDetailProps) {
  const { hebergements } = useSimulateurData()
  const hebergement = hebergements.find((h) => h.slug === slug)

  if (!hebergement) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Hebergement introuvable</p>
        <p className="text-sm mt-1">Aucun hebergement ne correspond au slug &quot;{slug}&quot;.</p>
      </div>
    )
  }

  const { acf } = hebergement
  const description = acf.description_immersive || acf.descriptif

  return (
    <div className="overflow-hidden">
      {/* Featured image */}
      {hebergement.featuredImage && (
        <div className="relative w-full h-48 md:h-64 overflow-hidden">
          <Image
            src={hebergement.featuredImage.url}
            alt={hebergement.featuredImage.alt || hebergement.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading uppercase font-extrabold text-2xl text-[#2A4A51]">
            {acf.nom || hebergement.title}
          </h2>

          {acf.niveau_confort && (
            <Badge className={cn("shrink-0", CONFORT_COLORS[acf.niveau_confort])}>
              {CONFORT_LABELS[acf.niveau_confort] || acf.niveau_confort}
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-4">
          {acf.capacite_personnes && (
            <InfoCard label="Capacite" value={`${acf.capacite_personnes} pers.`} />
          )}
          {acf.prix_nuit_unite && (
            <InfoCard label="Tarif" value={`${acf.prix_nuit_unite} \u20ac / nuit`} />
          )}
        </div>

        {/* Equipements chambre */}
        {acf.equipements_chambre && acf.equipements_chambre.length > 0 && (
          <div>
            <h3 className="font-heading uppercase text-xs tracking-wider text-muted-foreground font-bold mb-3">
              Equipements
            </h3>
            <div className="flex flex-wrap gap-2">
              {acf.equipements_chambre.map((eq) => (
                <Badge key={eq} variant="outline" className="rounded-full">
                  {formatEquipement(eq)}
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
                    alt={img.alt || `${hebergement.title} - photo ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="192px"
                  />
                </div>
              ))}
            </div>
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
