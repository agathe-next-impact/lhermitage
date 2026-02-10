"use client"

import { DevenirSocietaireSlideshow } from "@/components/features/devenir-societaire/devenir-societaire-slideshow"
import { DevenirSocietaireMotivations } from "@/components/features/devenir-societaire/devenir-societaire-motivations"
import { WordPressLink } from "@/components/content/wordpress-link"
import Image from "next/image"
import { motion } from "framer-motion"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

interface Props {
  page: any // WordPress page with ACF data
}

export function DevenirSocietairePage({ page }: Props) {
  const acf = page.acf || {}
  const chapeau = acf.chapeau || ""
  const bandeau = acf.bandeau || {}
  const pourquoiRejoindre = acf.pourquoi_rejoindre || {}
  const societaireData = acf.ce_quest_devenir_societaire || {}
  const scicInfo = acf["quest-ce_que_la_scic"] || {}
  const societariatInfo = acf.informations_societariat || []

  const galleryImages = [
    ...(bandeau.galerie?.images || []).map((img: any) => ({
      id: `bandeau-${img.ID}`,
      url: img.url,
      alt: img.alt || "Bandeau image",
    })),
  ].filter(Boolean)

  const motivations = [
    societaireData.motivation_1 ? { number: 1, text: societaireData.motivation_1 } : null,
    societaireData.motivation_2 ? { number: 2, text: societaireData.motivation_2 } : null,
    societaireData.motivation_3 ? { number: 3, text: societaireData.motivation_3 } : null,
    societaireData.motivation_4 ? { number: 4, text: societaireData.motivation_4 } : null,
  ].filter(Boolean) as Array<{ number: number; text: string }>

  const sectionColor = "#E75754"
  const greenColor = "#78AD7D"

  const pourquoiRejoindreColors = [
    "#2A4A51", // dark teal
    "#56939F", // lighter teal
    "#78AD7D", // green
    "#C14C66", // pink
    "#DC6F45", // orange
  ]

  return (
    <div className="overflow-x-hidden px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Qu'est-ce que la SCIC */}
        {scicInfo.titre &&
          scicInfo.caracteristiques_de_la_scic &&
          Array.isArray(scicInfo.caracteristiques_de_la_scic) &&
          scicInfo.caracteristiques_de_la_scic.length > 0 && (
            <div className="space-y-6 mt-24">
              <h3 className="text-2xl md:text-3xl font-bold uppercase" style={{ color: sectionColor }}>
                {scicInfo.titre}
              </h3>
              <div className="space-y-6">
                {scicInfo.caracteristiques_de_la_scic.map((item: any, idx: number) => (
                  <div key={idx} className="bg-brand-gray/5 p-4 md:p-6 rounded-lg">
                    {item.caracteristique?.titre && (
                      <h4
                        className="font-bold mb-2 uppercase tracking-wide text-base md:text-lg"
                        style={{ color: sectionColor }}
                      >
                        {item.caracteristique.titre}
                      </h4>
                    )}
                    {item.caracteristique?.descriptif && (
                      <div
                        className="text-brand-gray/80 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.caracteristique.descriptif) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Pourquoi rejoindre */}
        {pourquoiRejoindre.titre && (
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold uppercase" style={{ color: sectionColor }}>
              {pourquoiRejoindre.titre}
            </h3>
            {pourquoiRejoindre.raisons &&
              Array.isArray(pourquoiRejoindre.raisons) &&
              pourquoiRejoindre.raisons.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-10">
                  {pourquoiRejoindre.raisons.map((item: any, idx: number) => {
                    const bgColor = pourquoiRejoindreColors[idx % pourquoiRejoindreColors.length]

                    return (
                      <motion.li
                        key={idx}
                        className="text-base md:text-lg font-medium flex items-center gap-3 cursor-pointer px-4 py-4 rounded-full shadow-md"
                        style={{ backgroundColor: bgColor, color: "white" }}
                        initial={{ opacity: 1 }}
                        whileHover={{
                          scale: 1.02,
                          x: -8,
                          filter: "brightness(1.1)",
                          boxShadow: "0 8px 12px -1px rgba(0, 0, 0, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          transition: { duration: 0.2, ease: "easeOut" },
                        }}
                      >
                        <div
                          className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center"
                          style={{ transform: "rotate(-90deg)" }}
                        >
                          <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" />
                        </div>
                        {item.raison}
                      </motion.li>
                    )
                  })}
                </ul>
              )}
          </div>
        )}

        {/* Bandeau */}
        {bandeau.titre && (
          <div style={{ backgroundColor: sectionColor }} className="relative p-6 md:p-8 rounded-2xl overflow-hidden">
            <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 gap-6 items-center">
              {/* Left column: Chapeau text and CTA */}
              <div className="md:col-span-2 flex flex-col items-end space-y-4 w-full">
                {chapeau && <p className="text-white text-base md:text-lg leading-relaxed w-full">{chapeau}</p>}
                {bandeau.cta?.url && bandeau.titre && (
                  <WordPressLink
                    href={bandeau.cta.url}
                    className="inline-flex items-center gap-3 mx-auto bg-white font-semibold px-6 md:px-8 py-2 rounded-full hover:bg-white/90 transition-all hover:scale-105 uppercase tracking-wide mt-6 text-sm md:text-base"
                    style={{ color: sectionColor }}
                  >
                    <span className="font-black">{bandeau.titre}</span>
                    <div className="relative w-5 h-5 md:w-6 md:h-6 -mr-4 md:-mr-6 flex-shrink-0">
                      <Image src="/logo-arcs-coral.png" alt="" fill className="object-contain" />
                    </div>
                  </WordPressLink>
                )}
              </div>

              {/* Right column: Slideshow - Full width on mobile */}
              {galleryImages.length > 0 && (
                <div className="md:col-span-1 w-full flex justify-center md:justify-end">
                  <DevenirSocietaireSlideshow images={galleryImages} autoplayInterval={4000} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ce qu'est devenir sociétaire - Motivations */}
        {motivations.length > 0 && (
          <div className="space-y-6">
            {societaireData.titre && (
              <h3 className="text-2xl md:text-3xl font-bold uppercase" style={{ color: sectionColor }}>
                {societaireData.titre}
              </h3>
            )}
            <DevenirSocietaireMotivations motivations={motivations} />
          </div>
        )}
      </div>

      {Array.isArray(societariatInfo) && societariatInfo.length > 0 && (
        <div
          className="w-screen relative left-1/2 right-1/2 -mx-[50vw] mt-16 py-12 md:py-16"
          style={{ backgroundColor: greenColor }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold uppercase" style={{ color: greenColor }}>
              Informations de sociétariat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {societariatInfo.map((item: any, idx: number) => (
                <div key={idx} className="p-4 md:p-6 rounded-lg shadow-lg bg-white/30 backdrop-blur-sm">
                  {item.titre && (
                    <h4 className="font-bold text-white mb-3 uppercase tracking-wide text-base md:text-lg">
                      {item.titre}
                    </h4>
                  )}
                  {item.descriptif && (
                    <div
                      className="text-white/90 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.descriptif) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
