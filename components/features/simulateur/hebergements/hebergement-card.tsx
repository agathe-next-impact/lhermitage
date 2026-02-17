"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SimHebergement } from "@/lib/simulateur/types"

interface HebergementCardProps {
  hebergement: SimHebergement
  quantity: number
  onQuantityChange: (qty: number) => void
}

const confortConfig: Record<string, { label: string; className: string }> = {
  standard: {
    label: "Standard",
    className: "rounded-full bg-gray-100 text-gray-600 border-gray-200",
  },
  confort: {
    label: "Confort",
    className: "rounded-full bg-[#56939F]/10 text-[#56939F] border-[#56939F]/30",
  },
  premium: {
    label: "Premium",
    className: "rounded-full bg-[#E75754]/10 text-[#E75754] border-[#E75754]/30",
  },
}

export function HebergementCard({ hebergement, quantity, onQuantityChange }: HebergementCardProps) {
  const { acf, featuredImage } = hebergement
  const confort = acf.niveau_confort ?? "standard"
  const badge = confortConfig[confort] ?? confortConfig.standard
  const maxUnits = acf.nombre_unites ?? 99

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border shadow-sm bg-card overflow-hidden transition-all duration-300 hover:shadow-xl",
        quantity > 0 && "border-2 border-[#2A4A51] shadow-lg"
      )}
    >
      {/* Image */}
      {featuredImage && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt ?? acf.nom}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Badge
            className={cn(
              "absolute top-3 right-3 text-[10px] uppercase tracking-wider",
              badge.className
            )}
          >
            {badge.label}
          </Badge>
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-lg text-brand-dark">
              {acf.nom || hebergement.title}
            </h3>
            {!featuredImage && (
              <Badge className={cn("mt-1 text-[10px] uppercase tracking-wider", badge.className)}>
                {badge.label}
              </Badge>
            )}
          </div>
          {acf.prix_nuit_unite != null && (
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-[#2A4A51]">
                {acf.prix_nuit_unite}&euro;
              </span>
              <span className="block text-[11px] text-muted-foreground">/ nuit / unité</span>
            </div>
          )}
        </div>

        {/* Description */}
        {acf.descriptif && (
          <p className="text-sm text-muted-foreground line-clamp-2">{acf.descriptif}</p>
        )}

        {/* Capacity info */}
        {acf.capacite_personnes != null && (
          <p className="text-xs text-muted-foreground">
            Capacité :{" "}
            <span className="font-medium text-foreground">
              {acf.capacite_personnes} personne{acf.capacite_personnes > 1 ? "s" : ""}
            </span>{" "}
            par unité
            {acf.nombre_unites != null && (
              <>
                {" "}
                &middot; {acf.nombre_unites} unité{acf.nombre_unites > 1 ? "s" : ""} disponible
                {acf.nombre_unites > 1 ? "s" : ""}
              </>
            )}
          </p>
        )}

        {/* Equipements */}
        {acf.equipements_chambre && acf.equipements_chambre.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {acf.equipements_chambre.map((eq) => (
              <Badge
                key={eq}
                variant="outline"
                className="rounded-full bg-muted text-xs px-2.5 py-1 font-normal"
              >
                {eq}
              </Badge>
            ))}
          </div>
        )}

        {/* Quantity selector */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium text-muted-foreground">Quantité</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity <= 0}
              className="rounded-full w-8 h-8 border-2"
            >
              <span className="text-lg leading-none">&minus;</span>
            </Button>
            <span className="w-8 text-center font-bold tabular-nums">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => onQuantityChange(Math.min(maxUnits, quantity + 1))}
              disabled={quantity >= maxUnits}
              className="rounded-full w-8 h-8 border-2"
            >
              <span className="text-lg leading-none">+</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
