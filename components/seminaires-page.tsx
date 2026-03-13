"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { usePathname } from "next/navigation"
import { useRef, useState, useCallback, useEffect } from "react"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { MinimalCard } from "@/components/ui/minimal-card"
import { getColorForPath } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"
import type {
  SeminairesACF,
  WPPost,
  EspaceDeTravailACF,
  HebergementACF,
  ServiceACF,
} from "@/lib/wordpress/types"

interface SeminairesPageProps {
  acf: SeminairesACF
}

const SECTION_COLORS = [
  BRAND_COLORS.darkBlue,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.coral,
]

/* ───────────────────────── Compteur animé ───────────────────────── */

function AnimatedCounter({ value, color }: { value: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const numericMatch = value.match(/^(\d+)(.*)$/)
  const target = numericMatch ? parseInt(numericMatch[1], 10) : 0
  const suffix = numericMatch ? numericMatch[2] || "" : ""
  const isNumeric = !!numericMatch
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (!isInView || !isNumeric) return

    const duration = 1500
    const steps = 40
    const stepDuration = duration / steps
    const increment = target / steps

    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      setDisplayValue(Math.round(current) + suffix)
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, isNumeric, target, suffix])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-black" style={{ color }}>
      {isNumeric ? displayValue : value}
    </div>
  )
}

/* ───────────────────────── Carrousel Espaces ───────────────────────── */

function EspacesCarousel({
  espaces,
  sectionColor,
}: {
  espaces: WPPost<EspaceDeTravailACF>[] | undefined
  sectionColor: string
}) {
  const [active, setActive] = useState(0)
  const items = espaces || []

  if (items.length === 0) return null

  const current = items[active]
  const acf = current?.acf
  const featuredImage = current?._embedded?.["wp:featuredmedia"]?.[0]
  const photos = acf?.photos || acf?.images || []
  const mainImage = featuredImage
    ? { url: featuredImage.source_url, alt: featuredImage.alt_text }
    : photos[0]
      ? { url: photos[0].url, alt: photos[0].alt }
      : null

  return (
    <div className="space-y-4">
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2">
        {items.map((espace, idx) => (
          <button
            key={espace.id}
            onClick={() => setActive(idx)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor:
                active === idx ? SECTION_COLORS[idx % SECTION_COLORS.length] : "transparent",
              color: active === idx ? "white" : SECTION_COLORS[idx % SECTION_COLORS.length],
              border: `2px solid ${SECTION_COLORS[idx % SECTION_COLORS.length]}`,
            }}
          >
            {espace.acf?.nom || espace.title.rendered || `Espace ${idx + 1}`}
          </button>
        ))}
      </div>

      {/* Active card */}
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg"
        >
          {mainImage && (
            <div className="relative w-full md:w-1/2 min-h-[30vh] md:min-h-[40vh]">
              <Image
                src={mainImage.url || "/placeholder.svg"}
                alt={mainImage.alt || acf?.nom || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={85}
              />
            </div>
          )}
          <div
            className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center text-white"
            style={{ backgroundColor: SECTION_COLORS[active % SECTION_COLORS.length] }}
          >
            <h4 className="text-2xl md:text-3xl font-bold mb-3">
              {acf?.nom || current.title.rendered}
            </h4>

            {acf?.descriptif && (
              <div
                className="text-white/90 text-sm md:text-base mb-4 leading-relaxed prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(acf.descriptif) }}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────────────── Page complète ───────────────────────── */

export function SeminairesPage({ acf }: SeminairesPageProps) {
  const {
    promesse,
    espaces_travail,
    activites_teambuilding,
    restauration,
    hebergements_seminaires,
    temoignages,
    contact,
  } = acf

  const pathname = usePathname()
  const menuColor = useMenuColor(pathname)
  const sectionColor = menuColor || getColorForPath(pathname) || BRAND_COLORS.green

  return (
    <div className="pl-6 pt-4">
      <div className="max-w-7xl space-y-16">
        {/* ─── 3. ESPACES DE TRAVAIL ─── */}
        {espaces_travail && (
          <section className="space-y-6">
            {espaces_travail.titre && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl text-brand-dark"
              >
                {decodeHtmlEntities(espaces_travail.titre)}
              </motion.h2>
            )}

            {espaces_travail.introduction && (
              <div
                className="text-lg text-brand-gray/80 prose prose-stone prose-lg max-w-3xl [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(espaces_travail.introduction) }}
              />
            )}

            <EspacesCarousel espaces={espaces_travail.espaces} sectionColor={sectionColor} />

            {/* Facilitation stratégique */}
            {espaces_travail.facilitation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-6 md:p-8 rounded-2xl overflow-hidden"
                style={{ backgroundColor: BRAND_COLORS.darkBlue }}
              >
                <div className="text-white">
                  {espaces_travail.facilitation.titre && (
                    <h3 className="text-2xl font-bold mb-4">
                      {espaces_travail.facilitation.titre}
                    </h3>
                  )}
                  {espaces_travail.facilitation.contenu && (
                    <div
                      className="prose prose-invert prose-sm md:prose-base max-w-none mb-4"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(espaces_travail.facilitation.contenu),
                      }}
                    />
                  )}
                  {espaces_travail.facilitation.badge && (
                    <span
                      className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                      style={{ backgroundColor: "white", color: BRAND_COLORS.darkBlue }}
                    >
                      {espaces_travail.facilitation.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* ─── 4. ACTIVITÉS TEAM BUILDING ─── */}
        {activites_teambuilding && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Titre + description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 md:p-8 flex flex-col justify-end"
                style={{ backgroundColor: BRAND_COLORS.teal }}
              >
                {activites_teambuilding.titre && (
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {decodeHtmlEntities(activites_teambuilding.titre)}
                  </h2>
                )}
                {activites_teambuilding.sous_titre && (
                  <div
                    className="text-base text-white/80 [&_p]:m-0"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(activites_teambuilding.sous_titre),
                    }}
                  />
                )}
                <Link
                  href="/sejours-collectifs/activites"
                  className="w-max inline-flex items-end gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:brightness-110 shadow-sm"
                  style={{ backgroundColor: "white", color: BRAND_COLORS.teal }}
                >
                  Voir toutes les activités
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>

              {/* Cartes activités */}
              {(activites_teambuilding.activites || []).slice(0, 3).map((activite, i) => {
                const featuredImage = activite._embedded?.["wp:featuredmedia"]?.[0]
                return (
                  <motion.div
                    key={activite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <MinimalCard
                      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md transition-shadow"
                      style={{ backgroundColor: `${BRAND_COLORS.teal}15` }}
                    >
                      <div className="px-2 pb-4">
                        <h5
                          className="text-base font-bold mb-1"
                          style={{ color: BRAND_COLORS.teal }}
                        >
                          {activite.acf?.nom || activite.title.rendered}
                        </h5>
                        {activite.acf?.descriptif && (
                          <div
                            className="text-brand-gray/70 text-xs line-clamp-3 [&_p]:m-0"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(activite.acf.descriptif),
                            }}
                          />
                        )}
                      </div>
                      {featuredImage && (
                        <Image
                          src={featuredImage.source_url || "/placeholder.svg"}
                          alt={featuredImage.alt_text || activite.acf?.nom || ""}
                          width={600}
                          height={400}
                          className="rounded-xl object-cover w-full h-36"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </MinimalCard>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── 5. RESTAURATION ─── */}
        {restauration && restauration.services && restauration.services.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Titre + description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 md:p-8 flex flex-col justify-end"
                style={{ backgroundColor: BRAND_COLORS.orange }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Se Restaurer</h2>
                <Link
                  href="/services"
                  className="w-max inline-flex items-end gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:brightness-110 shadow-sm"
                  style={{ backgroundColor: "white", color: BRAND_COLORS.orange }}
                >
                  Voir tous les services
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>

              {/* Cartes services */}
              {restauration.services.slice(0, 3).map((service, idx) => {
                const featuredImage = service._embedded?.["wp:featuredmedia"]?.[0]
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <MinimalCard
                      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md transition-shadow"
                      style={{ backgroundColor: `${BRAND_COLORS.orange}15` }}
                    >
                      <div className="px-2 pb-4">
                        <h5
                          className="text-base font-bold mb-1"
                          style={{ color: BRAND_COLORS.orange }}
                        >
                          {service.acf?.nom || service.title.rendered}
                        </h5>
                        {service.acf?.descriptif && (
                          <div
                            className="text-brand-gray/70 text-xs line-clamp-3 [&_p]:m-0"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(service.acf.descriptif),
                            }}
                          />
                        )}
                      </div>
                      {featuredImage && (
                        <Image
                          src={featuredImage.source_url || "/placeholder.svg"}
                          alt={featuredImage.alt_text || service.acf?.nom || ""}
                          width={600}
                          height={400}
                          className="rounded-xl object-cover w-full h-36"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </MinimalCard>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── 6. HÉBERGEMENTS ─── */}
        {hebergements_seminaires && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Titre + description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 md:p-8 flex flex-col justify-end"
                style={{ backgroundColor: BRAND_COLORS.rose }}
              >
                {hebergements_seminaires.titre && (
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {decodeHtmlEntities(hebergements_seminaires.titre)}
                  </h2>
                )}
                {hebergements_seminaires.sous_titre && (
                  <div
                    className="text-base text-white/80 [&_p]:m-0"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(hebergements_seminaires.sous_titre),
                    }}
                  />
                )}
                <Link
                  href="/hebergements"
                  className="w-max inline-flex items-end gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:brightness-110 shadow-sm"
                  style={{ backgroundColor: "white", color: BRAND_COLORS.rose }}
                >
                  Voir tous les hébergements
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>

              {/* Cartes hébergements */}
              {(hebergements_seminaires.hebergements || []).slice(0, 3).map((heb, idx) => {
                const featuredImage = heb._embedded?.["wp:featuredmedia"]?.[0]
                const photos = heb.acf?.photos || heb.acf?.images || []
                const mainImage = featuredImage
                  ? { url: featuredImage.source_url, alt: featuredImage.alt_text }
                  : photos[0]
                    ? { url: photos[0].url, alt: photos[0].alt }
                    : null

                return (
                  <motion.div
                    key={heb.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <MinimalCard
                      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md transition-shadow"
                      style={{ backgroundColor: `${BRAND_COLORS.rose}15` }}
                    >
                      <div className="px-2 pb-4">
                        <h5
                          className="text-base font-bold mb-1"
                          style={{ color: BRAND_COLORS.rose }}
                        >
                          {heb.acf?.nom || heb.title.rendered}
                        </h5>
                        {heb.acf?.descriptif && (
                          <div
                            className="text-brand-gray/70 text-xs line-clamp-3 [&_p]:m-0"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(heb.acf.descriptif) }}
                          />
                        )}
                      </div>
                      {mainImage && (
                        <Image
                          src={mainImage.url || "/placeholder.svg"}
                          alt={mainImage.alt || heb.acf?.nom || ""}
                          width={600}
                          height={400}
                          className="rounded-xl object-cover w-full h-36"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </MinimalCard>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── LA PROMESSE ─── */}
        {promesse && (
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              {promesse.storytelling && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="md:w-1/2 prose prose-stone prose-lg max-w-none text-brand-gray/80"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(promesse.storytelling) }}
                />
              )}
              {promesse.image && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="md:w-1/2 relative rounded-2xl overflow-hidden min-h-[300px]"
                >
                  <Image
                    src={promesse.image.url || "/placeholder.svg"}
                    alt={promesse.image.alt || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              )}
            </div>

            {/* Chiffres clés animés */}
            {promesse.chiffres_cles && promesse.chiffres_cles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                {promesse.chiffres_cles.map((chiffre, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.15 }}
                    viewport={{ once: true }}
                    className="text-center p-6 rounded-2xl bg-muted/30"
                  >
                    <AnimatedCounter
                      value={chiffre.valeur || "0"}
                      color={SECTION_COLORS[idx % SECTION_COLORS.length]}
                    />
                    {chiffre.unite && (
                      <p
                        className="text-lg font-semibold mt-1"
                        style={{ color: SECTION_COLORS[idx % SECTION_COLORS.length] }}
                      >
                        {chiffre.unite}
                      </p>
                    )}
                    {chiffre.label && (
                      <p className="text-sm text-brand-gray/60 mt-1">{chiffre.label}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── 7. TÉMOIGNAGES ─── */}
        {temoignages && (
          <section
            className="relative p-6 md:p-10 rounded-2xl overflow-hidden"
            style={{ backgroundColor: BRAND_COLORS.teal }}
          >
            {temoignages.titre && (
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                {decodeHtmlEntities(temoignages.titre)}
              </h2>
            )}

            {/* Citations */}
            {temoignages.citations && temoignages.citations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {temoignages.citations.map((temo, idx) => (
                  <motion.blockquote
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="p-5 md:p-6 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg"
                  >
                    <div className="text-brand-gray italic text-sm md:text-base mb-3 leading-relaxed [&_p]:m-0 [&_p]:inline">
                      &laquo;{" "}
                      {temo.citation && (
                        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(temo.citation) }} />
                      )}{" "}
                      &raquo;
                    </div>
                    <footer className="flex items-center gap-2">
                      <div
                        className="w-8 h-0.5 rounded-full"
                        style={{ backgroundColor: SECTION_COLORS[idx % SECTION_COLORS.length] }}
                      />
                      <div>
                        {temo.auteur && (
                          <cite className="not-italic font-bold text-sm text-brand-dark">
                            {temo.auteur}
                          </cite>
                        )}
                        {temo.role && (
                          <span className="text-xs text-brand-gray/60 block">{temo.role}</span>
                        )}
                      </div>
                    </footer>
                  </motion.blockquote>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── LOGOS PARTENAIRES ─── */}
        {temoignages?.logos && temoignages.logos.length > 0 && (
          <section
            className="relative p-6 md:p-10 rounded-2xl overflow-hidden"
            style={{ backgroundColor: `${BRAND_COLORS.teal}15` }}
          >
            <p
              className="text-sm uppercase tracking-wider mb-4"
              style={{ color: BRAND_COLORS.teal }}
            >
              Ils nous font confiance
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {temoignages.logos.map((logo, idx) => (
                <div key={idx} className="relative h-14 bg-white rounded-lg p-2">
                  <Image
                    src={logo.url || "/placeholder.svg"}
                    alt={logo.alt || "Partenaire"}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 30vw, (max-width: 768px) 22vw, 15vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 8. CONTACT / CONCIERGERIE ─── */}
        {contact && (
          <section id="contact" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-12 rounded-2xl overflow-hidden"
              style={{ backgroundColor: sectionColor }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {contact.photo && (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-white/30 shadow-lg">
                    <Image
                      src={contact.photo.url || "/placeholder.svg"}
                      alt={contact.photo.alt || contact.nom_contact || ""}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                )}

                <div className="flex-1 text-center md:text-left">
                  {contact.titre && (
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {decodeHtmlEntities(contact.titre)}
                    </h2>
                  )}

                  {contact.conciergerie && (
                    <div
                      className="prose prose-invert prose-sm md:prose-base max-w-none text-white/80 mb-6"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(contact.conciergerie) }}
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-md"
                        style={{ backgroundColor: "white", color: sectionColor }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        {contact.email}
                      </a>
                    )}

                    {contact.telephone && (
                      <a
                        href={`tel:${contact.telephone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-md"
                        style={{
                          backgroundColor: "transparent",
                          border: "2px solid rgba(255,255,255,0.5)",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {contact.telephone}
                      </a>
                    )}
                  </div>

                  {contact.cta_lien?.url && contact.cta_texte && (
                    <a
                      href={contact.cta_lien.url}
                      target={contact.cta_lien.target || undefined}
                      className="inline-block mt-6 px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 hover:brightness-110 shadow-lg"
                      style={{ backgroundColor: "white", color: sectionColor }}
                    >
                      {contact.cta_texte}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>
    </div>
  )
}
