"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useRef, useState, useCallback, useEffect } from "react"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { getColorForPath } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"
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

/* ───────────────────────── Scroll horizontal immersif ───────────────────────── */

function HistoryCarousel({
  sections,
  sectionColor,
}: {
  sections: NonNullable<PatrimoineACF["sections"]>
  sectionColor: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const isScrolling = useRef(false)

  const goTo = useCallback(
    (idx: number) => {
      if (idx === active) return
      isScrolling.current = true
      setActive(idx)
      scrollRef.current?.children[idx]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      })
      setTimeout(() => {
        isScrolling.current = false
      }, 600)
    },
    [active]
  )

  const prev = useCallback(() => goTo(Math.max(0, active - 1)), [active, goTo])
  const next = useCallback(
    () => goTo(Math.min(sections.length - 1, active + 1)),
    [active, goTo, sections.length]
  )

  // Sync active dot on manual scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const scrollLeft = el.scrollLeft
      const width = el.clientWidth
      const idx = Math.round(scrollLeft / width)
      if (idx !== active) {
        setActive(idx)
      }
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [active])

  // Wheel → horizontal scroll : intercept vertical scroll when carousel is in view
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const onWheel = (e: WheelEvent) => {
      // Ignore horizontal scroll gestures
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      // Don't hijack if already animating
      if (isScrolling.current) {
        e.preventDefault()
        return
      }

      const atStart = active === 0 && e.deltaY < 0
      const atEnd = active === sections.length - 1 && e.deltaY > 0
      // Let page scroll normally when at boundaries
      if (atStart || atEnd) return

      e.preventDefault()
      if (e.deltaY > 0) next()
      else prev()
    }

    wrapper.addEventListener("wheel", onWheel, { passive: false })
    return () => wrapper.removeEventListener("wheel", onWheel)
  }, [active, next, prev, sections.length])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next()
      else if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sections.map((section, idx) => {
          const bgColor = SECTION_COLORS[idx % SECTION_COLORS.length]

          return (
            <div key={idx} className="snap-start flex-shrink-0 w-full">
              <div className="relative min-h-[70vh] md:min-h-[60vh] flex flex-col md:flex-row rounded-2xl overflow-hidden mx-1">
                {/* Panneau image — fond immersif */}
                <div className="relative w-full md:w-1/2 min-h-[35vh] md:min-h-[60vh]">
                  {section.image ? (
                    <>
                      <Image
                        src={section.image.url || "/placeholder.svg"}
                        alt={section.image.alt || section.titre || ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={85}
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 hidden md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
                    </>
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
                  )}

                  {/* Badge année */}
                  {section.annee && (
                    <div
                      className="absolute top-6 left-6 px-4 py-2 rounded-full text-white text-sm md:text-base font-bold tracking-wider"
                      style={{ backgroundColor: bgColor }}
                    >
                      {section.annee}
                    </div>
                  )}

                  {/* Numéro de slide — overlay bas gauche */}
                  <div className="absolute bottom-6 left-6 flex items-baseline gap-1">
                    <span className="text-5xl md:text-7xl font-black text-white/20 leading-none">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Panneau contenu */}
                <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 flex flex-col justify-center bg-white">
                  <AnimatePresence mode="wait">
                    {active === idx && (
                      <motion.div
                        key={idx}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {section.titre && (
                          <h3 className="text-2xl md:text-3xl mb-4" style={{ color: sectionColor }}>
                            {decodeHtmlEntities(section.titre)}
                          </h3>
                        )}

                        {section.accroche && (
                          <p className="mb-4 text-base md:text-lg font-medium italic text-brand-gray/70">
                            {decodeHtmlEntities(section.accroche)}
                          </p>
                        )}

                        {section.contenu && (
                          <div
                            className="prose prose-stone prose-sm md:prose-base max-w-none text-brand-gray/80 [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.contenu) }}
                          />
                        )}

                        {section.citation && (
                          <blockquote
                            className="mt-6 border-l-4 pl-4 italic text-muted-foreground text-sm md:text-base"
                            style={{ borderColor: bgColor }}
                          >
                            {decodeHtmlEntities(section.citation)}
                          </blockquote>
                        )}

                        {section.video_url && (
                          <div className="mt-6 aspect-video overflow-hidden rounded-xl">
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation flèches */}
      {sections.length > 1 && (
        <>
          <button
            onClick={prev}
            disabled={active === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Précédent"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={active === sections.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Suivant"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots navigation */}
      {sections.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="group flex items-center gap-2 transition-all"
              aria-label={`Aller à ${section.annee || `section ${idx + 1}`}`}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: active === idx ? "2rem" : "0.5rem",
                  backgroundColor:
                    active === idx ? SECTION_COLORS[idx % SECTION_COLORS.length] : "#d1d5db",
                }}
              />
              {active === idx && section.annee && (
                <span
                  className="text-xs font-bold tracking-wide normal-case"
                  style={{ color: SECTION_COLORS[idx % SECTION_COLORS.length] }}
                >
                  {section.annee}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── Page complète ───────────────────────── */

export function PatrimoinePage({ acf }: PatrimoinePageProps) {
  const { introduction, sections, valeurs, publics } = acf
  const pathname = usePathname()
  const menuColor = useMenuColor(pathname)
  const sectionColor = menuColor || getColorForPath(pathname) || BRAND_COLORS.coral

  if (!sections || sections.length === 0) {
    return (
      <div className="p-0">
        <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Contenu en cours de rédaction</h3>
          <p className="text-muted-foreground">Cette page sera bientôt disponible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden pt-4">
      <div className="max-w-7xl space-y-16">
        {/* Introduction : citation + texte */}
        {(introduction?.citation || introduction?.texte) && (
          <div className="space-y-6 mt-2 pl-2 pt-2">
            {introduction.citation && (
              <blockquote
                className="border-l-4 pl-6 py-2 text-xl md:text-2xl font-medium italic text-brand-gray/80"
                style={{ color: BRAND_COLORS.dark, borderColor: sectionColor }}
              >
                {decodeHtmlEntities(introduction.citation)}
              </blockquote>
            )}
            {introduction.texte && (
              <div
                className="prose prose-stone prose-lg max-w-none text-brand-gray/80"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(introduction.texte) }}
              />
            )}
          </div>
        )}

        {/* Sections historiques — scroll horizontal immersif */}
        <HistoryCarousel sections={sections} sectionColor={sectionColor} />

        {/* Valeurs — cartes colorées style Devenir sociétaire */}
        {valeurs && valeurs.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
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
            <h3 className="text-2xl md:text-3xl text-white mb-6">Pour qui ?</h3>
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
