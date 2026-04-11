"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { WordPressLink } from "@/components/content/wordpress-link"
import type { WPImage, WPLink } from "@/lib/wordpress/types"

interface SocietaireCTAProps {
  surtitre?: string
  titre?: string
  description?: string
  ctaTexte?: string
  ctaUrl?: WPLink
  image?: WPImage
  sectionColor: string
}

/**
 * Bloc CTA "Devenir sociétaire" — réutilisable sur toutes les pages
 * (accueil, activités, nous soutenir, etc.).
 *
 * Layout : texte + CTA à gauche, image à droite (stacked sur mobile).
 */
export function SocietaireCTA({
  surtitre,
  titre,
  description,
  ctaTexte,
  ctaUrl,
  image,
  sectionColor,
}: SocietaireCTAProps) {
  if (!titre && !description && !ctaTexte) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden p-6 md:p-10"
      style={{ backgroundColor: sectionColor }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-5 text-white">
          {surtitre && (
            <p className="uppercase tracking-wider text-xs md:text-sm font-bold opacity-90">
              {surtitre}
            </p>
          )}
          {titre && (
            <h2 className="text-2xl md:text-4xl font-black leading-tight">{titre}</h2>
          )}
          {description && (
            <p className="text-base md:text-lg leading-relaxed text-white/90">{description}</p>
          )}
          {ctaTexte && ctaUrl?.url && (
            <div>
              <WordPressLink
                href={ctaUrl.url}
                target={ctaUrl.target}
                className="inline-flex items-center gap-3 bg-white font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-105 uppercase tracking-wide text-sm md:text-base"
                style={{ color: sectionColor }}
              >
                <span className="font-black">{ctaTexte}</span>
                <ArrowRight className="h-4 w-4" />
              </WordPressLink>
            </div>
          )}
        </div>

        {image?.url && (
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src={image.url}
              alt={image.alt || titre || ""}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </motion.section>
  )
}
