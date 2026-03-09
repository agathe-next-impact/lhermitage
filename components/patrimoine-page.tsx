"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import type { PatrimoineACF } from "@/lib/wordpress/types"

interface PatrimoinePageProps {
  acf: PatrimoineACF
}

const SECTION_COLORS = [
  BRAND_COLORS.darkBlue,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.coral,
]

const VALEUR_COLORS = [
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.teal,
]

export function PatrimoinePage({ acf }: PatrimoinePageProps) {
  const { sections, valeurs, publics } = acf

  if (!sections || sections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-2">
        <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Contenu en cours de rédaction</h3>
          <p className="text-muted-foreground">Cette page sera bientôt disponible.</p>
        </div>
      </div>
    )
  }

  const sectionColor = BRAND_COLORS.coral

  return (
    <div className="overflow-x-hidden px-2">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Sections historiques en bento grid :
            - lignes de 2 boîtes sur 1 col chacune
            - dernière boîte occupe 2 colonnes */}
        <div className="space-y-6 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, idx) => {
              const bgColor = SECTION_COLORS[idx % SECTION_COLORS.length]
              const isLast = idx === sections.length - 1
              const isWide = isLast

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${
                    isWide ? "md:col-span-2" : ""
                  }`}
                >
                  {/* Image header */}
                  {section.image && (
                    <div
                      className={`relative w-full ${isWide ? "h-[220px] md:h-[360px]" : "h-[180px] md:h-[260px]"}`}
                    >
                      <Image
                        src={section.image.url || "/placeholder.svg"}
                        alt={section.image.alt || section.titre || ""}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes={
                          isWide
                            ? "(max-width: 768px) 100vw, 80vw"
                            : "(max-width: 768px) 100vw, 40vw"
                        }
                        quality={80}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {section.annee && (
                        <div
                          className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs md:text-sm font-bold uppercase tracking-wider"
                          style={{ backgroundColor: bgColor }}
                        >
                          {section.annee}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 md:p-8 bg-white">
                    {!section.image && section.annee && (
                      <span
                        className="inline-block px-3 py-1 mb-3 rounded-full text-white text-xs md:text-sm font-bold uppercase tracking-wider"
                        style={{ backgroundColor: bgColor }}
                      >
                        {section.annee}
                      </span>
                    )}

                    {section.titre && (
                      <h3
                        className="text-xl md:text-2xl font-bold uppercase mb-2"
                        style={{ color: sectionColor }}
                      >
                        {decodeHtmlEntities(section.titre)}
                      </h3>
                    )}

                    {section.accroche && (
                      <p className="mb-4 text-sm md:text-base font-medium italic text-brand-gray/70">
                        {decodeHtmlEntities(section.accroche)}
                      </p>
                    )}

                    {section.contenu && (
                      <div
                        className="prose prose-stone prose-sm max-w-none text-brand-gray/80 [&>p]:mb-2 md:[&>p]:mb-4 [&>ul]:mb-2 md:[&>ul]:mb-4 [&>ol]:mb-2 md:[&>ol]:mb-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.contenu) }}
                      />
                    )}

                    {section.citation && (
                      <blockquote
                        className="mt-4 border-l-4 pl-4 italic text-muted-foreground"
                        style={{ borderColor: bgColor }}
                      >
                        {decodeHtmlEntities(section.citation)}
                      </blockquote>
                    )}

                    {section.video_url && (
                      <div className="mt-4 aspect-video overflow-hidden rounded-lg">
                        <iframe
                          src={section.video_url.replace("watch?v=", "embed/")}
                          title={section.titre || "Vidéo"}
                          allow="fullscreen"
                          sandbox="allow-scripts allow-same-origin allow-presentation"
                          className="h-full w-full border-0"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Valeurs — cartes colorées style Devenir sociétaire */}
        {valeurs && valeurs.length > 0 && (
          <div className="space-y-6">
            <h3
              className="text-2xl md:text-3xl font-bold uppercase"
              style={{ color: sectionColor }}
            >
              Nos valeurs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {valeurs.map((valeur, i) => {
                const cardColor = VALEUR_COLORS[i % VALEUR_COLORS.length]
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-5 md:p-6 rounded-xl shadow-md cursor-pointer"
                    style={{ backgroundColor: cardColor, color: "white" }}
                    whileHover={{
                      scale: 1.02,
                      x: -8,
                      filter: "brightness(1.1)",
                      boxShadow:
                        "0 8px 12px -1px rgba(0, 0, 0, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    <div
                      className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center mt-1"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" />
                    </div>
                    <div>
                      {valeur.titre && (
                        <h4 className="font-bold text-base md:text-lg uppercase tracking-wide mb-1">
                          {decodeHtmlEntities(valeur.titre)}
                        </h4>
                      )}
                      {valeur.descriptif && (
                        <p className="text-sm md:text-base text-white/90 leading-relaxed">
                          {decodeHtmlEntities(valeur.descriptif)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pour qui — bandeau coloré style Devenir sociétaire */}
        {publics && publics.length > 0 && (
          <div
            style={{ backgroundColor: BRAND_COLORS.teal }}
            className="relative p-6 md:p-8 rounded-2xl overflow-hidden"
          >
            <h3 className="text-2xl md:text-3xl font-bold uppercase text-white mb-6">Pour qui ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publics.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4 md:p-6 rounded-lg shadow-lg bg-background backdrop-blur-sm"
                >
                  {row.public && (
                    <h4 className="font-bold text-brand-dark mb-2 uppercase tracking-wide text-base md:text-lg">
                      {decodeHtmlEntities(row.public)}
                    </h4>
                  )}
                  {row.proposition && (
                    <p className="text-brand-gray text-sm md:text-base">
                      {decodeHtmlEntities(row.proposition)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
