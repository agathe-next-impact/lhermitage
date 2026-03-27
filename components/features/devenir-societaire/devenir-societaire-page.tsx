"use client"

import { DevenirSocietaireSlideshow } from "@/components/features/devenir-societaire/devenir-societaire-slideshow"
import { DevenirSocietaireMotivations } from "@/components/features/devenir-societaire/devenir-societaire-motivations"
import { WordPressLink } from "@/components/content/wordpress-link"
import Image from "next/image"

import { usePathname } from "next/navigation"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { getColorForPath } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"
import { BRAND_COLORS } from "@/lib/theme/colors"

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

  const pathname = usePathname()
  const menuColor = useMenuColor(pathname)
  const sectionColor = menuColor || getColorForPath(pathname) || "#E75754"
  const greenColor = "#78AD7D"


  return (
    <div className="overflow-x-hidden md:pl-2 md:pt-2">
      <div className="max-w-7xl space-y-16">
        {/* Qu'est-ce que la SCIC */}
        {scicInfo.titre &&
          scicInfo.caracteristiques_de_la_scic &&
          Array.isArray(scicInfo.caracteristiques_de_la_scic) &&
          scicInfo.caracteristiques_de_la_scic.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                {scicInfo.caracteristiques_de_la_scic.map((item: any, idx: number) => {
                  const scicColors = [BRAND_COLORS.teal, BRAND_COLORS.rose, BRAND_COLORS.green, BRAND_COLORS.dark]
                  const bgColor = scicColors[idx % scicColors.length]
                  return (
                  <div key={idx} className="rounded-lg space-y-4 p-4" style={{ backgroundColor: bgColor }}>
                    {item.caracteristique?.titre && (
                      <h3 className="text-white text-2xl md:text-3xl">{item.caracteristique.titre}</h3>
                    )}
                    {item.caracteristique?.descriptif && (
                      <div
                        className="text-white/80 prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(item.caracteristique.descriptif),
                        }}
                      />
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          )}

        {/* Pourquoi rejoindre */}
        {pourquoiRejoindre.titre &&
          pourquoiRejoindre.raisons &&
          Array.isArray(pourquoiRejoindre.raisons) &&
          pourquoiRejoindre.raisons.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
                {pourquoiRejoindre.titre}
              </h3>
              <DevenirSocietaireMotivations
                motivations={pourquoiRejoindre.raisons.map((item: any, idx: number) => ({
                  number: idx + 1,
                  text: item.raison,
                }))}
              />
            </div>
          )}

        {/* Bandeau */}
        {bandeau.titre && (
          <div
            style={{ backgroundColor: sectionColor }}
            className="relative p-6 md:p-8 rounded-2xl overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 gap-6 items-center">
              {/* Left column: Chapeau text and CTA */}
              <div className="md:col-span-2 flex flex-col items-end space-y-4 w-full">
                {chapeau && (
                  <p className="text-white text-base md:text-lg leading-relaxed w-full">
                    {chapeau}
                  </p>
                )}
                {bandeau.cta?.url && bandeau.titre && (
                  <WordPressLink
                    href={bandeau.cta.url}
                    className="inline-flex gap-3 bg-white font-semibold px-6 md:px-8 py-2 rounded-full hover:bg-white/90 transition-all hover:scale-105 uppercase tracking-wide mt-6 text-sm md:text-base"
                    style={{ color: sectionColor }}
                  >
                    <span className="font-black">{bandeau.titre}</span>
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
              <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
                {societaireData.titre}
              </h3>
            )}
            <DevenirSocietaireMotivations motivations={motivations} />
          </div>
        )}
      </div>

      {Array.isArray(societariatInfo) && societariatInfo.length > 0 && (
        <div
          className="w-full relative mt-16 py-4 rounded-xl bg-brand-pink">
          <div className="max-w-7xl p-4">
            <h3 className="text-2xl md:text-3xl text-white">
              Informations de sociétariat
            </h3>
            <div className="grid grid-cols-1 gap-6 md:gap-8 mt-8">
              {societariatInfo.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 md:p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-sm"
                >
                  {item.titre && (
                    <h4 className="font-bold text-white mb-3 uppercase tracking-wide text-lg md:text-2xl">
                      {item.titre}
                    </h4>
                  )}
                  {item.descriptif && (
                    <div
                      className="text-white/80 prose prose-invert max-w-none [&_li]:marker:text-white"
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
