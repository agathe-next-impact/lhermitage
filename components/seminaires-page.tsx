"use client"

import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { usePathname } from "next/navigation"
import { useRef, useState, useCallback, useEffect } from "react"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { getColorForPath } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"
import type {
  SeminairesACF,
  WPPost,
  EspaceDeTravailACF,
  ActiviteACF,
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
  const isNumeric = !!numericMatch
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (!isInView || !isNumeric || !numericMatch) return

    const target = parseInt(numericMatch[1], 10)
    const suffix = numericMatch[2] || ""
    const duration = 1500
    const steps = 40
    const stepDuration = duration / steps

    let current = 0
    const increment = target / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      setDisplayValue(Math.round(current) + suffix)
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, isNumeric, numericMatch, value])

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
              <p className="text-white/90 text-sm md:text-base mb-4 leading-relaxed">
                {decodeHtmlEntities(acf.descriptif)}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────────────── Filtre activités ───────────────────────── */

function ActivitesGrid({
  activites,
  sectionColor,
}: {
  activites: WPPost<ActiviteACF>[] | undefined
  sectionColor: string
}) {
  const items = activites || []

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((activite, i) => {
        const color = SECTION_COLORS[i % SECTION_COLORS.length]
        const featuredImage = activite._embedded?.["wp:featuredmedia"]?.[0]

        return (
          <motion.div
            key={activite.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            viewport={{ once: true }}
            className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ border: `1px solid ${color}20` }}
          >
            {featuredImage && (
              <div className="relative h-36">
                <Image
                  src={featuredImage.source_url || "/placeholder.svg"}
                  alt={featuredImage.alt_text || activite.acf?.nom || ""}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <div className="p-4">
              <h5 className="font-bold text-sm mb-1" style={{ color }}>
                {activite.acf?.nom || activite.title.rendered}
              </h5>
              {activite.acf?.descriptif && (
                <p className="text-xs text-brand-gray/70 line-clamp-3">
                  {decodeHtmlEntities(activite.acf.descriptif)}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ───────────────────────── Page complète ───────────────────────── */

export function SeminairesPage({ acf }: SeminairesPageProps) {
  const {
    hero_seminaires,
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
    <div className="overflow-x-hidden">
      {/* ─── 1. HERO SECTION ─── */}
      {hero_seminaires && (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background video or image */}
          {hero_seminaires.video?.url ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={hero_seminaires.image?.url}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src={hero_seminaires.video.url}
                type={hero_seminaires.video.mime_type || "video/mp4"}
              />
            </video>
          ) : hero_seminaires.image ? (
            <Image
              src={hero_seminaires.image.url || "/placeholder.svg"}
              alt={hero_seminaires.image.alt || ""}
              fill
              className="object-cover"
              priority
              quality={90}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: sectionColor }} />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Content */}
          <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
            {hero_seminaires.accroche && (
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                {decodeHtmlEntities(hero_seminaires.accroche)}
              </motion.h1>
            )}

            {hero_seminaires.sous_titre && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              >
                {decodeHtmlEntities(hero_seminaires.sous_titre)}
              </motion.p>
            )}

            {hero_seminaires.cta_texte && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <a
                  href={hero_seminaires.cta_lien?.url || "#contact"}
                  target={hero_seminaires.cta_lien?.target || undefined}
                  className="inline-block px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: sectionColor }}
                >
                  {hero_seminaires.cta_texte}
                </a>
              </motion.div>
            )}
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-1.5"
            >
              <div className="w-1.5 h-3 rounded-full bg-white/70" />
            </motion.div>
          </motion.div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 space-y-20 py-16">
        {/* ─── 2. LA PROMESSE ─── */}
        {promesse && (
          <section className="space-y-8">
            {promesse.titre && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold"
                style={{ color: sectionColor }}
              >
                {decodeHtmlEntities(promesse.titre)}
              </motion.h2>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-center">
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
                  className="md:w-1/2 relative rounded-2xl overflow-hidden aspect-[4/3]"
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

        {/* ─── 3. ESPACES DE TRAVAIL ─── */}
        {espaces_travail && (
          <section className="space-y-6">
            {espaces_travail.titre && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold"
                style={{ color: sectionColor }}
              >
                {decodeHtmlEntities(espaces_travail.titre)}
              </motion.h2>
            )}

            {espaces_travail.introduction && (
              <p className="text-lg text-brand-gray/80 max-w-3xl">
                {decodeHtmlEntities(espaces_travail.introduction)}
              </p>
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
                      style={{ backgroundColor: BRAND_COLORS.orange, color: "white" }}
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
          <section className="space-y-6">
            {activites_teambuilding.titre && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold"
                style={{ color: sectionColor }}
              >
                {decodeHtmlEntities(activites_teambuilding.titre)}
              </motion.h2>
            )}
            {activites_teambuilding.sous_titre && (
              <p className="text-lg text-brand-gray/70">
                {decodeHtmlEntities(activites_teambuilding.sous_titre)}
              </p>
            )}

            <ActivitesGrid
              activites={activites_teambuilding.activites}
              sectionColor={sectionColor}
            />
          </section>
        )}

        {/* ─── 5. RESTAURATION ─── */}
        {restauration && restauration.services && restauration.services.length > 0 && (
          <section className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold"
              style={{ color: sectionColor }}
            >
              Se Restaurer
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restauration.services.map((service, idx) => {
                const color = SECTION_COLORS[idx % SECTION_COLORS.length]
                const featuredImage = service._embedded?.["wp:featuredmedia"]?.[0]
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    className="rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden"
                    style={{ borderLeft: `4px solid ${color}` }}
                  >
                    {featuredImage && (
                      <div className="relative h-32">
                        <Image
                          src={featuredImage.source_url || "/placeholder.svg"}
                          alt={featuredImage.alt_text || ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="font-bold text-base mb-1" style={{ color }}>
                        {service.acf?.nom || service.title.rendered}
                      </h4>
                      {service.acf?.descriptif && (
                        <p className="text-sm text-brand-gray/70">
                          {decodeHtmlEntities(service.acf.descriptif)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── 6. HÉBERGEMENTS ─── */}
        {hebergements_seminaires && (
          <section className="space-y-6">
            {hebergements_seminaires.titre && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold"
                style={{ color: sectionColor }}
              >
                {decodeHtmlEntities(hebergements_seminaires.titre)}
              </motion.h2>
            )}
            {hebergements_seminaires.sous_titre && (
              <p className="text-lg text-brand-gray/70">
                {decodeHtmlEntities(hebergements_seminaires.sous_titre)}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(hebergements_seminaires.hebergements || []).map((heb, idx) => {
                const color = SECTION_COLORS[idx % SECTION_COLORS.length]
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  >
                    {mainImage && (
                      <div className="relative h-48 md:h-56">
                        <Image
                          src={mainImage.url || "/placeholder.svg"}
                          alt={mainImage.alt || heb.acf?.nom || ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="text-xl font-bold mb-2" style={{ color }}>
                        {heb.acf?.nom || heb.title.rendered}
                      </h4>
                      {heb.acf?.descriptif && (
                        <p className="text-sm text-brand-gray/70 leading-relaxed">
                          {decodeHtmlEntities(heb.acf.descriptif)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
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
                    <p className="text-brand-gray italic text-sm md:text-base mb-3 leading-relaxed">
                      &laquo; {temo.citation && decodeHtmlEntities(temo.citation)} &raquo;
                    </p>
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

            {/* Logos partenaires */}
            {temoignages.logos && temoignages.logos.length > 0 && (
              <div>
                <p className="text-white/70 text-sm uppercase tracking-wider mb-4">
                  Ils nous font confiance
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {temoignages.logos.map((logo, idx) => (
                    <div key={idx} className="relative h-10 w-24 bg-white/90 rounded-lg p-2">
                      <Image
                        src={logo.url || "/placeholder.svg"}
                        alt={logo.alt || "Partenaire"}
                        fill
                        className="object-contain p-1"
                        sizes="96px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              style={{
                backgroundColor: `${sectionColor}10`,
                border: `2px solid ${sectionColor}30`,
              }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {contact.photo && (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-white shadow-lg">
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
                    <h2
                      className="text-2xl md:text-3xl font-bold mb-4"
                      style={{ color: sectionColor }}
                    >
                      {decodeHtmlEntities(contact.titre)}
                    </h2>
                  )}

                  {contact.conciergerie && (
                    <div
                      className="prose prose-stone prose-sm md:prose-base max-w-none text-brand-gray/80 mb-6"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(contact.conciergerie) }}
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-md"
                        style={{ backgroundColor: sectionColor }}
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
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-md"
                        style={{
                          backgroundColor: "white",
                          color: sectionColor,
                          border: `2px solid ${sectionColor}`,
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
                      className="inline-block mt-6 px-8 py-4 rounded-full text-lg font-bold text-white transition-all hover:scale-105 hover:brightness-110 shadow-lg"
                      style={{ backgroundColor: BRAND_COLORS.orange }}
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
