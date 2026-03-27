"use client"

import Image from "next/image"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, LayoutGroup } from "framer-motion"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import type {
  RecrutementACF,
  RecrutementOffre,
  RecrutementBloc,
  RecrutementTemoignage,
  RecrutementChiffreCle,
  RecrutementChampFormulaire,
} from "@/lib/wordpress/types"
import {
  Briefcase,
  GraduationCap,
  Heart,
  Lightbulb,
  MapPin,
  Send,
  Star,
  TreePine,
  Users,
  CheckCircle2,
  Quote,
  X,
  type LucideIcon,
} from "lucide-react"

// --- Icon resolver ---

const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  heart: Heart,
  lightbulb: Lightbulb,
  "map-pin": MapPin,
  send: Send,
  star: Star,
  trees: TreePine,
  users: Users,
}

function ResolvedIcon({
  name,
  className,
  style,
}: {
  name?: string
  className?: string
  style?: React.CSSProperties
}) {
  if (!name) return null
  // If it's an emoji (starts with non-ASCII), render directly
  if (/^[^\u0000-\u007F]/.test(name)) {
    return (
      <span className={className} style={style}>
        {name}
      </span>
    )
  }
  const Icon = ICON_MAP[name.toLowerCase()]
  if (Icon) return <Icon className={className} style={style} />
  return (
    <span className={className} style={style}>
      {name}
    </span>
  )
}

// --- Section colors ---

const SECTION_COLORS = [
  BRAND_COLORS.coral,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
]

// --- Animation variants ---

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─────────────────────── Section: Chiffres Cles ───────────────────────

export function ChiffresCles({ chiffres }: { chiffres: RecrutementChiffreCle[] }) {
  if (!chiffres?.length) return null

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {chiffres.map((c, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          className="text-center p-4 rounded-xl bg-brand-teal/20 backdrop-blur-sm"
        >
          <ResolvedIcon name={c.icone} className="h-6 w-6 mx-auto mb-2 text-brand-teal/80" />
          {c.categorie && (
            <p className="text-xs font-medium uppercase tracking-wider text-brand-teal/80 mb-1">
              {c.categorie}
            </p>
          )}
          <p className="text-2xl md:text-3xl font-bold text-brand-teal">{c.valeur}</p>
          {c.description && <p className="text-sm text-brand-teal/80 mt-1">{c.description}</p>}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─────────────────────── Section: Introduction ───────────────────────

export function IntroductionSection({
  introduction,
}: {
  introduction: NonNullable<RecrutementACF["introduction"]>
}) {
  return (
    <motion.section
      className="space-y-8 p-2"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
    >
      {introduction.titre && (
        <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-brand-teal">
          {introduction.titre}
        </motion.h2>
      )}
      {introduction.texte && (
        <motion.div
          variants={fadeInUp}
          className="prose text-lg text-brand-teal/80 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(introduction.texte) }}
        />
      )}
      {introduction.chiffres_cles && <ChiffresCles chiffres={introduction.chiffres_cles} />}
    </motion.section>
  )
}

// ─────────────────────── Section: Offre Cards (collapse/expand) ───────────────────────

function CollapsedOffreCard({
  offre,
  index,
  onExpand,
}: {
  offre: RecrutementOffre
  index: number
  onExpand: () => void
}) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length]

  return (
    <motion.div
      layoutId={`offre-card-${index}`}
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md rounded-xl overflow-hidden relative cursor-pointer"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
      data-offre-card
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onExpand()
      }}
    >
      <div className="px-2 pb-6 flex flex-col items-start gap-3">
        <div className={`flex items-start ${offre.icone ? "gap-3" : ""}`}>
          {offre.icone && (
            <ResolvedIcon name={offre.icone} className="h-6 w-6 shrink-0 mt-1 text-white/80" />
          )}
          <motion.h3 layoutId={`offre-title-${index}`} className="text-2xl font-bold text-white">
            {offre.titre}
          </motion.h3>
        </div>

        {offre.descriptif && <p className="text-sm text-white/90">{offre.descriptif}</p>}

        <button
          onClick={onExpand}
          style={{ color }}
          className="rounded-full bg-white font-semibold transition-colors hover:bg-white/90 shadow-md text-sm h-9 px-6"
        >
          Découvrir
        </button>
      </div>
    </motion.div>
  )
}

function ExpandedOffreCard({
  offre,
  index,
  onCollapse,
}: {
  offre: RecrutementOffre
  index: number
  onCollapse: () => void
}) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length]

  return (
    <motion.div
      layoutId={`offre-card-${index}`}
      className="flex flex-col p-2 pt-6 shadow-lg rounded-xl overflow-hidden relative"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
    >
      {/* Close button */}
      <motion.button
        onClick={onCollapse}
        className="absolute top-3 right-3 z-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors p-1.5"
        aria-label="Fermer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        <X className="w-5 h-5 text-white" />
      </motion.button>

      <div className="px-2 pb-6">
        <div className={`flex items-start mb-4 ${offre.icone ? "gap-3" : ""}`}>
          {offre.icone && (
            <ResolvedIcon name={offre.icone} className="h-6 w-6 shrink-0 mt-1 text-white/80" />
          )}
          <motion.h3 layoutId={`offre-title-${index}`} className="text-2xl font-bold text-white">
            {offre.titre}
          </motion.h3>
        </div>

        {offre.descriptif && (
          <motion.p
            className="text-white/90 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {offre.descriptif}
          </motion.p>
        )}

        <div className="bg-white/80 rounded-xl p-5 space-y-4">
          {offre.missions && offre.missions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <p className="text-sm font-semibold text-stone-700 mb-2">Missions principales</p>
              <ul className="space-y-1.5">
                {offre.missions.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color }} />
                    <span>{m.texte}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {offre.profil && offre.profil.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <p className="text-sm font-semibold text-stone-700 mb-2">Profil recherché</p>
              <ul className="space-y-1.5">
                {offre.profil.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <Star className="h-4 w-4 shrink-0 mt-0.5" style={{ color }} />
                    <span>{p.texte}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {offre.cta_lien && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <a
              href={offre.cta_lien}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-white/90 shadow-md"
              style={{ backgroundColor: "white", color }}
            >
              {offre.cta_texte || "Découvrir la mission"}
              <Send className="h-4 w-4" />
            </a>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function OffresSection({ offres }: { offres: RecrutementOffre[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const scrollYBeforeExpand = useRef<number>(0)
  const scrollRafId = useRef<number>(0)

  const cancelScroll = useCallback(() => {
    if (scrollRafId.current) {
      cancelAnimationFrame(scrollRafId.current)
      scrollRafId.current = 0
    }
  }, [])

  const smoothScrollTo = useCallback(
    (target: number, duration = 600) => {
      cancelScroll()
      const start = window.scrollY
      const delta = target - start
      if (Math.abs(delta) < 1) return
      const startTime = performance.now()

      function easeInOutCubic(t: number) {
        return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
      }

      function step(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        window.scrollTo(0, start + delta * easeInOutCubic(progress))
        if (progress < 1) {
          scrollRafId.current = requestAnimationFrame(step)
        } else {
          scrollRafId.current = 0
        }
      }

      scrollRafId.current = requestAnimationFrame(step)
    },
    [cancelScroll]
  )

  const handleExpand = useCallback(
    (index: number) => {
      cancelScroll()
      setExpandedIndex((prev) => {
        if (prev === index) return prev
        if (prev === null) {
          scrollYBeforeExpand.current = window.scrollY
        }
        return index
      })
    },
    [cancelScroll]
  )

  const handleCollapse = useCallback(() => {
    cancelScroll()
    const scrollTarget = scrollYBeforeExpand.current
    setExpandedIndex(null)
    setTimeout(() => {
      smoothScrollTo(scrollTarget, 500)
    }, 300)
  }, [cancelScroll, smoothScrollTo])

  useEffect(() => {
    if (expandedIndex === null) return
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`expanded-offre-${expandedIndex}`)
        if (el) {
          const offset = 50
          const targetY = el.getBoundingClientRect().top + window.scrollY - offset
          smoothScrollTo(targetY, 350)
        }
      })
    }, 280)
    return () => clearTimeout(timer)
  }, [expandedIndex, smoothScrollTo])

  useEffect(() => cancelScroll, [cancelScroll])

  useEffect(() => {
    if (expandedIndex === null) return
    function handleClickOutside(e: MouseEvent) {
      const el = document.getElementById(`expanded-offre-${expandedIndex}`)
      const target = e.target as HTMLElement
      if (target.closest("[data-offre-card]")) return
      if (el && !el.contains(target)) {
        handleCollapse()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expandedIndex, handleCollapse])

  if (!offres?.length) return null

  return (
    <section id="offres">
      <LayoutGroup>
        <div className="grid md:grid-cols-2 gap-2">
          {offres.map((offre, i) => {
            const isExpanded = i === expandedIndex

            if (isExpanded) {
              return (
                <motion.div
                  key={i}
                  id={`expanded-offre-${i}`}
                  layout
                  className="col-span-1 md:col-span-2"
                  transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
                >
                  <ExpandedOffreCard offre={offre} index={i} onCollapse={handleCollapse} />
                </motion.div>
              )
            }

            return (
              <motion.div
                key={i}
                layout
                animate={{
                  filter: expandedIndex !== null ? "opacity(0.7)" : "opacity(1)",
                }}
                transition={{
                  layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                  duration: 0.3,
                }}
              >
                <CollapsedOffreCard offre={offre} index={i} onExpand={() => handleExpand(i)} />
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </section>
  )
}

// ─────────────────────── Section: Cadre de Vie ───────────────────────

const CADRE_BG_COLORS = [
  `${BRAND_COLORS.teal}20`,
  `${BRAND_COLORS.coral}20`,
  `${BRAND_COLORS.green}20`,
  `${BRAND_COLORS.rose}20`,
  `${BRAND_COLORS.orange}20`,
]

function CadreBloc({ bloc, index }: { bloc: RecrutementBloc; index: number }) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length]
  const bgColor = CADRE_BG_COLORS[index % CADRE_BG_COLORS.length]

  return (
    <motion.div
      variants={fadeInUp}
      className="md:w-max rounded-2xl p-2 pr-8 flex items-center gap-6"
      style={{ backgroundColor: bgColor }}
    >
      {bloc.image && (
        <div className="h-28 w-28 relative shrink-0 rounded-xl overflow-hidden">
          <Image
            src={bloc.image.url}
            alt={bloc.image.alt || bloc.titre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className={`flex items-center ${bloc.icone ? "gap-3" : ""}`}>
          {bloc.icone && <ResolvedIcon name={bloc.icone} className="h-6 w-6" style={{ color }} />}
          <h3 className="text-lg font-bold text-brand-gray-900">{bloc.titre}</h3>
        </div>

        {bloc.texte_intro && <p className="text-brand-gray-700/80 mt-1">{bloc.texte_intro}</p>}

        {bloc.elements && bloc.elements.length > 0 && (
          <ul className="space-y-3 mt-4">
            {bloc.elements.map((el, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="h-2 w-2 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div>
                  {el.titre && <p className="font-medium text-brand-dark">{el.titre}</p>}
                  {el.description && <p className="text-sm text-brand-dark/80">{el.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}

        {bloc.note && (
          <p
            className="text-sm italic text-brand-dark/80 border-l-2 pl-3 mt-4"
            style={{ borderColor: color }}
          >
            {bloc.note}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function CadreDeVieSection({
  cadre,
}: {
  cadre: NonNullable<RecrutementACF["cadre_de_vie"]>
}) {
  if (!cadre.blocs?.length) return null

  return (
    <motion.section
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {cadre.titre && (
        <motion.h2
          variants={fadeInUp}
          className="text-2xl md:text-3xl font-bold text-brand-gray-900"
        >
          {cadre.titre}
        </motion.h2>
      )}
      <div className="grid items-end gap-4 pt-4">
        {cadre.blocs.map((bloc, i) => (
          <CadreBloc key={i} bloc={bloc} index={i} />
        ))}
      </div>
    </motion.section>
  )
}

// ─────────────────────── Section: Temoignages ───────────────────────

function TemoignageCard({ temoignage }: { temoignage: RecrutementTemoignage }) {
  return (
    <motion.div variants={fadeInUp} className="w-full rounded-2xl mx-auto p-6 md:p-8 shadow-sm">
      <Quote className="h-8 w-8 text-brand-dark mb-4" />
      <blockquote className="text-brand-dark text-xl italic leading-relaxed mb-6">
        {temoignage.citation}
      </blockquote>
      <div className="flex items-center gap-3">
        {temoignage.photo && (
          <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0">
            <Image
              src={temoignage.photo.url}
              alt={temoignage.auteur}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-brand-dark/90">{temoignage.auteur}</p>
          {temoignage.role && <p className="text-sm text-brand-dark/70">{temoignage.role}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export function TemoignagesSection({ temoignages }: { temoignages: RecrutementTemoignage[] }) {
  if (!temoignages?.length) return null

  return (
    <motion.section
      className="w-full space-y-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.h2
        variants={fadeInUp}
        className="text-2xl md:text-3xl font-bold text-brand-pink"
      ></motion.h2>
      <div className="grid gap-6">
        {temoignages.map((t, i) => (
          <TemoignageCard key={i} temoignage={t} />
        ))}
      </div>
    </motion.section>
  )
}

// ─────────────────────── Section: Candidature ───────────────────────

function FormField({ champ }: { champ: RecrutementChampFormulaire }) {
  const baseClasses =
    "w-full rounded-lg border border-stone-200 bg-brand-coral px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 transition"

  const label = (
    <label className="block text-sm font-medium text-stone-700 mb-1">
      {champ.label}
      {champ.requis && <span className="text-red-500 ml-1">*</span>}
    </label>
  )

  switch (champ.type_champ) {
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            className={`${baseClasses} min-h-[100px]`}
            required={champ.requis}
            placeholder={champ.label}
          />
        </div>
      )
    case "select": {
      const options = champ.options?.split("\n").filter(Boolean) || []
      return (
        <div>
          {label}
          <select className={baseClasses} required={champ.requis}>
            <option value="">Selectionnez...</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.trim()}>
                {opt.trim()}
              </option>
            ))}
          </select>
        </div>
      )
    }
    case "file":
      return (
        <div>
          {label}
          <input type="file" className={baseClasses} required={champ.requis} />
        </div>
      )
    default:
      return (
        <div>
          {label}
          <input
            type={champ.type_champ || "text"}
            className={baseClasses}
            required={champ.requis}
            placeholder={champ.label}
          />
        </div>
      )
  }
}

export function CandidatureSection({
  candidature,
}: {
  candidature: NonNullable<RecrutementACF["candidature"]>
}) {
  return (
    <motion.section
      id="candidature"
      className="space-y-6 bg-brand-coral rounded-2xl p-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
    >
      {candidature.titre && (
        <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-white">
          {candidature.titre}
        </motion.h2>
      )}

      {candidature.texte && (
        <motion.div
          variants={fadeInUp}
          className="prose text-white max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(candidature.texte) }}
        />
      )}

      {candidature.email && (
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${candidature.email}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_COLORS.coral }}
          >
            <Send className="h-4 w-4" />
            {candidature.email}
          </a>
          {candidature.email_secondaire && (
            <a
              href={`mailto:${candidature.email_secondaire}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <Send className="h-4 w-4" />
              {candidature.email_secondaire}
            </a>
          )}
        </motion.div>
      )}

      {candidature.activer_formulaire && candidature.champs && candidature.champs.length > 0 && (
        <motion.form
          variants={fadeInUp}
          className="rounded-2xl bg-stone-50 p-6 md:p-8 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          {candidature.champs.map((champ, i) => (
            <FormField key={i} champ={champ} />
          ))}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_COLORS.coral }}
          >
            <Send className="h-4 w-4" />
            Envoyer ma candidature
          </button>
        </motion.form>
      )}
    </motion.section>
  )
}
