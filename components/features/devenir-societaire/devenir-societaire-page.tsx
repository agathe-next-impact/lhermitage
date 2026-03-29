"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { Users, Heart, Landmark, Vote, ArrowRight } from "lucide-react"
import { DevenirSocietaireMotivations } from "@/components/features/devenir-societaire/devenir-societaire-motivations"
import { DevenirSocietaireSlideshow } from "@/components/features/devenir-societaire/devenir-societaire-slideshow"
import { DevenirSocietaireHistorique } from "@/components/features/devenir-societaire/devenir-societaire-historique"
import { DevenirSocietaireDocuments } from "@/components/features/devenir-societaire/devenir-societaire-documents"
import { WordPressLink } from "@/components/content/wordpress-link"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { getColorForPath } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface Props {
  page: any
}

const SCIC_ICONS = [Landmark, Users, Vote, Heart]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
}

export function DevenirSocietairePage({ page }: Props) {
  const acf = page.acf || {}
  const chapeau = acf.chapeau || ""
  const bandeau = acf.bandeau || {}
  const pourquoiRejoindre = acf.pourquoi_rejoindre || {}
  const societaireData = acf.ce_quest_devenir_societaire || {}
  const scicInfo = acf["quest-ce_que_la_scic"] || {}
  const societariatInfo = acf.informations_societariat || []
  const historique = acf.historique || {}
  const documentsLegaux = acf.documents_legaux || {}

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
  const sectionColor = menuColor || getColorForPath(pathname) || BRAND_COLORS.coral

  const scicColors = [BRAND_COLORS.teal, BRAND_COLORS.rose, BRAND_COLORS.green, BRAND_COLORS.darkBlue]

  return (
    <div className="overflow-x-hidden md:pl-2 md:pt-2">
      <div className="max-w-7xl space-y-16">
        {/* --- Chapeau + CTA Bandeau --- */}
        {(chapeau || bandeau.titre) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="relative rounded-2xl overflow-hidden p-6 md:p-10"
            style={{ backgroundColor: sectionColor }}
          >
            <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-6">
                {chapeau && (
                  <motion.p
                    variants={fadeUp}
                    custom={0}
                    className="text-white text-lg md:text-xl leading-relaxed"
                  >
                    {chapeau}
                  </motion.p>
                )}
                {bandeau.cta?.url && bandeau.titre && (
                  <motion.div variants={fadeUp} custom={1}>
                    <WordPressLink
                      href={bandeau.cta.url}
                      className="inline-flex items-center gap-3 bg-white font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-105 uppercase tracking-wide text-sm md:text-base"
                      style={{ color: sectionColor }}
                    >
                      <span className="font-black">{bandeau.titre}</span>
                      <ArrowRight className="h-4 w-4" />
                    </WordPressLink>
                  </motion.div>
                )}
              </div>

              {galleryImages.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  custom={2}
                  className="md:col-span-1 w-full flex justify-center md:justify-end"
                >
                  <DevenirSocietaireSlideshow images={galleryImages} autoplayInterval={4000} />
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* --- Pourquoi nous rejoindre --- */}
        {pourquoiRejoindre.titre &&
          Array.isArray(pourquoiRejoindre.raisons) &&
          pourquoiRejoindre.raisons.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
                {pourquoiRejoindre.titre}
              </h3>
              <DevenirSocietaireMotivations
                motivations={pourquoiRejoindre.raisons.map((item: any, idx: number) => ({
                  number: idx + 1,
                  text: item.raison,
                }))}
              />
            </section>
          )}

        {/* --- Qu'est-ce que la SCIC --- */}
        {scicInfo.titre &&
          Array.isArray(scicInfo.caracteristiques_de_la_scic) &&
          scicInfo.caracteristiques_de_la_scic.length > 0 && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="space-y-4"
            >
              <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
                {scicInfo.titre}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scicInfo.caracteristiques_de_la_scic.map((item: any, idx: number) => {
                  const bgColor = scicColors[idx % scicColors.length]
                  const Icon = SCIC_ICONS[idx % SCIC_ICONS.length]
                  return (
                    <motion.div
                      key={idx}
                      variants={fadeUp}
                      custom={idx}
                      className="rounded-xl p-6 md:p-8 space-y-4"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        {item.caracteristique?.titre && (
                          <h4 className="text-white text-xl md:text-2xl font-bold">
                            {item.caracteristique.titre}
                          </h4>
                        )}
                      </div>
                      {item.caracteristique?.descriptif && (
                        <div
                          className="text-white/85 prose prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-white [&_span]:!text-inherit"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(item.caracteristique.descriptif),
                          }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )}

        {/* --- Ce qu'est devenir sociétaire (motivations) --- */}
        {/* Disponible quand ceQuestDevenirSocietaire sera activé dans WP GraphQL */}
        {motivations.length > 0 && (
          <section className="space-y-6">
            {societaireData.titre && (
              <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
                {societaireData.titre}
              </h3>
            )}
            <DevenirSocietaireMotivations motivations={motivations} />
          </section>
        )}

        {/* --- Chapeau + CTA Bandeau --- */}
        {(chapeau || bandeau.titre) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="relative rounded-2xl overflow-hidden p-6 md:p-10"
            style={{ backgroundColor: sectionColor }}
          >
            <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-6">
                {chapeau && (
                  <motion.p
                    variants={fadeUp}
                    custom={0}
                    className="text-white text-lg md:text-xl leading-relaxed"
                  >
                    {chapeau}
                  </motion.p>
                )}
                {bandeau.cta?.url && bandeau.titre && (
                  <motion.div variants={fadeUp} custom={1}>
                    <WordPressLink
                      href={bandeau.cta.url}
                      className="inline-flex items-center gap-3 bg-white font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-105 uppercase tracking-wide text-sm md:text-base"
                      style={{ color: sectionColor }}
                    >
                      <span className="font-black">{bandeau.titre}</span>
                      <ArrowRight className="h-4 w-4" />
                    </WordPressLink>
                  </motion.div>
                )}
              </div>

              {galleryImages.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  custom={2}
                  className="md:col-span-1 w-full flex justify-center md:justify-end"
                >
                  <DevenirSocietaireSlideshow images={galleryImages} autoplayInterval={4000} />
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* --- Historique et feuille de route --- */}
        <DevenirSocietaireHistorique
          sectionColor={sectionColor}
          titre={historique.titre}
          descriptif={historique.descriptif}
          etapes={historique.etapes}
        />

      {/* --- Informations sociétariat --- */}
      {Array.isArray(societariatInfo) && societariatInfo.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="w-full relative mt-16 py-8 px-6 md:px-8 rounded-xl bg-brand-dark"
        >
          <div className="max-w-7xl">
            <motion.h3
              variants={fadeUp}
              custom={0}
              className="text-2xl md:text-3xl text-white mb-8"
            >
              Informations de sociétariat
            </motion.h3>
            <div className="grid grid-cols-1 gap-6">
              {societariatInfo.map((item: any, idx: number) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  custom={idx + 1}
                  className="p-6 rounded-xl bg-white/15 backdrop-blur-sm"
                >
                  {item.titre && (
                    <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-lg md:text-2xl">
                      {item.titre}
                    </h4>
                  )}
                  {item.descriptif && (
                    <div
                      className="text-white/85 prose prose-invert max-w-none [&_li]:marker:text-white [&_span]:!text-inherit [&_.elementor-element]:!p-0 [&_.elementor-widget]:!mb-0"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.descriptif) }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      
        {/* --- Documents légaux --- */}
        {/* fichiers sub-fields need map_graphql_types_from_location_rules: 1 in WP */}
        <DevenirSocietaireDocuments
          sectionColor={sectionColor}
          titre={documentsLegaux.titre}
          fichiers={documentsLegaux.fichiers}
        />

        {/* --- Chapeau + CTA Bandeau --- */}
        {(chapeau || bandeau.titre) && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="relative rounded-2xl overflow-hidden p-6 md:p-10"
            style={{ backgroundColor: sectionColor }}
          >
            <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-6">
                {chapeau && (
                  <motion.p
                    variants={fadeUp}
                    custom={0}
                    className="text-white text-lg md:text-xl leading-relaxed"
                  >
                    {chapeau}
                  </motion.p>
                )}
                {bandeau.cta?.url && bandeau.titre && (
                  <motion.div variants={fadeUp} custom={1}>
                    <WordPressLink
                      href={bandeau.cta.url}
                      className="inline-flex items-center gap-3 bg-white font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-105 uppercase tracking-wide text-sm md:text-base"
                      style={{ color: sectionColor }}
                    >
                      <span className="font-black">{bandeau.titre}</span>
                      <ArrowRight className="h-4 w-4" />
                    </WordPressLink>
                  </motion.div>
                )}
              </div>

              {galleryImages.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  custom={2}
                  className="md:col-span-1 w-full flex justify-center md:justify-end"
                >
                  <DevenirSocietaireSlideshow images={galleryImages} autoplayInterval={4000} />
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
