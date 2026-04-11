"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Heart } from "lucide-react"
import type { NousSoutenirACF } from "@/lib/wordpress/types"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { WordPressLink } from "@/components/content/wordpress-link"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useMenuColor } from "@/components/menu-colors-provider"
import { getColorForPath } from "@/lib/page-colors"
import { HeroRotatingWords } from "./hero-rotating-words"
import { PillarSection } from "./pillar-section"
import { SocietaireCTA } from "./societaire-cta"

interface NousSoutenirPageProps {
  data: NousSoutenirACF
}

// One brand color per pilier (4 piliers, 4 colors). Falls back gracefully
// if there are more piliers than colors.
const PILLAR_COLORS = [
  BRAND_COLORS.green, // Écologie
  BRAND_COLORS.teal, // Coopération
  BRAND_COLORS.rose, // Démocratie
  BRAND_COLORS.coral, // Solidarité
] as const

export function NousSoutenirPage({ data }: NousSoutenirPageProps) {
  // Couleur dérivée du contexte de la page hôte (menu / path) — défaut coral.
  const pathname = usePathname()
  const menuColor = useMenuColor(pathname)
  const sectionColor = menuColor || getColorForPath(pathname) || BRAND_COLORS.coral

  const heroColor = sectionColor
  const fiscalColor = BRAND_COLORS.darkBlue
  const presentationColor = BRAND_COLORS.darkBlue
  const societaireColor = sectionColor

  return (
    <div className="overflow-x-clip md:pl-2 md:pt-2">
      <div className="max-w-7xl space-y-16 md:space-y-24">
        {/* === SECTION 1 — Bandeau de mots rotatifs ===
            Le titre / sous-titre / image du hero sont rendus par le bento
            header (override `getHeader` dans page-registry.ts). Ici on ne
            conserve que l'animation des mots rotatifs, qui est l'apport
            unique du composant. */}
        <HeroRotatingWords motsRotatifs={data.hero?.mots_rotatifs} sectionColor={heroColor} />

        {/* === SECTION 2–5 — Piliers === */}
        {Array.isArray(data.piliers) && data.piliers.length > 0 && (
          <div className="divide-y divide-black/5">
            {data.piliers.map((pilier, idx) => (
              <PillarSection
                key={`pilier-${idx}`}
                pilier={pilier}
                color={PILLAR_COLORS[idx % PILLAR_COLORS.length]}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* === SECTION 6 — CTA Don principal === */}
        {data.cta_don?.texte && data.cta_don?.url?.url && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <WordPressLink
              href={data.cta_don.url.url}
              target={data.cta_don.url.target || "_blank"}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-white text-lg md:text-2xl font-black uppercase tracking-wide shadow-xl hover:scale-105 transition-transform"
              style={{ backgroundColor: heroColor }}
            >
              <Heart className="h-6 w-6" />
              <span>{data.cta_don.texte}</span>
              <ArrowRight className="h-5 w-5" />
            </WordPressLink>
          </motion.section>
        )}

        {/* === SECTION 7 — Réduction fiscale === */}
        {(data.fiscal?.titre || data.fiscal?.description) && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-stone-50 p-6 md:p-12 border border-stone-200/60"
          >
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {data.fiscal.titre && (
                <h2
                  className="text-2xl md:text-4xl font-black"
                  style={{ color: fiscalColor }}
                >
                  {data.fiscal.titre}
                </h2>
              )}
              {data.fiscal.description && (
                <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed">
                  {data.fiscal.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-10">
              {data.fiscal.image_tableau?.url && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md bg-white">
                  <Image
                    src={data.fiscal.image_tableau.url}
                    alt={data.fiscal.image_tableau.alt || "Tableau de réduction fiscale"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              )}
              {data.fiscal.image_detail?.url && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md bg-white">
                  <Image
                    src={data.fiscal.image_detail.url}
                    alt={data.fiscal.image_detail.alt || "Détail réduction fiscale"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {data.fiscal.cta_texte && data.fiscal.cta_url?.url && (
              <div className="mt-10 flex justify-center">
                <WordPressLink
                  href={data.fiscal.cta_url.url}
                  target={data.fiscal.cta_url.target || "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-black uppercase tracking-wide text-sm md:text-base shadow-lg hover:scale-105 transition-transform"
                  style={{ backgroundColor: heroColor }}
                >
                  <Heart className="h-4 w-4" />
                  <span>{data.fiscal.cta_texte}</span>
                  <ArrowRight className="h-4 w-4" />
                </WordPressLink>
              </div>
            )}
          </motion.section>
        )}

        {/* === SECTION 8 — Présentation tiers-lieu === */}
        {(data.presentation?.intro || data.presentation?.surtitre) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {data.presentation.surtitre && (
                <p
                  className="uppercase tracking-wider text-xs md:text-sm font-bold"
                  style={{ color: presentationColor }}
                >
                  {data.presentation.surtitre}
                </p>
              )}
              {data.presentation.intro && (
                <h2 className="text-2xl md:text-4xl font-black text-brand-dark leading-tight">
                  {data.presentation.intro}
                </h2>
              )}
            </div>

            <div className="max-w-4xl mx-auto space-y-5 text-base md:text-lg leading-relaxed text-brand-dark/85">
              {data.presentation.paragraphe_1 && <p>{data.presentation.paragraphe_1}</p>}
              {data.presentation.paragraphe_2 && <p>{data.presentation.paragraphe_2}</p>}
              {data.presentation.paragraphe_3 && <p>{data.presentation.paragraphe_3}</p>}
            </div>

            {/* Compteurs */}
            {Array.isArray(data.presentation.compteurs) &&
              data.presentation.compteurs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 pt-6">
                  {data.presentation.compteurs.map((c, idx) => (
                    <div key={`compteur-${idx}`} className="text-center space-y-1">
                      <AnimatedCounter
                        value={c.valeur ?? 0}
                        color={presentationColor}
                        className="text-4xl md:text-5xl font-black"
                      />
                      {c.label && (
                        <div className="text-xs md:text-sm uppercase tracking-wide text-brand-dark/70 font-semibold">
                          {c.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </motion.section>
        )}

        {/* === SECTION 9 — CTA Devenir sociétaire === */}
        <SocietaireCTA
          surtitre={data.societaire?.surtitre}
          titre={data.societaire?.titre}
          description={data.societaire?.description}
          ctaTexte={data.societaire?.cta_texte}
          ctaUrl={data.societaire?.cta_url}
          image={data.societaire?.image}
          sectionColor={societaireColor}
        />
      </div>
    </div>
  )
}
