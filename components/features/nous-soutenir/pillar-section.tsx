"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { NousSoutenirPilier } from "@/lib/wordpress/types"
import { ImpactCard } from "./impact-card"

interface PillarSectionProps {
  pilier: NousSoutenirPilier
  color: string
  /** Alternance gauche/droite : index pair → image à droite, impair → image à gauche. */
  index?: number
}

/**
 * Reusable section for one pillar (Écologie, Coopération, Démocratie, Solidarité).
 * Layout: 2 columns desktop (text + 2x2 cards / image), stacked on mobile.
 * Image side alternates based on `index`.
 */
export function PillarSection({ pilier, color, index = 0 }: PillarSectionProps) {
  const cards = pilier.cards || []
  const imageRight = index % 2 === 0

  return (
    <section className="py-4 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: imageRight ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg ${
            imageRight ? "md:order-2" : "md:order-1"
          }`}
        >
          {pilier.image?.url ? (
            <Image
              src={pilier.image.url}
              alt={pilier.image.alt || pilier.titre || ""}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: color, opacity: 0.2 }} />
          )}
        </motion.div>

        {/* Texte + cards */}
        <div className={`space-y-6 ${imageRight ? "md:order-1" : "md:order-2"}`}>
          {pilier.titre && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight"
              style={{ color }}
            >
              {pilier.titre}
            </motion.h2>
          )}

          {pilier.sous_titre && (
            <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed">
              {pilier.sous_titre}
            </p>
          )}

          {cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card, i) => (
                <ImpactCard
                  key={`${card.montant}-${i}`}
                  montant={card.montant}
                  description={card.description}
                  color={color}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
