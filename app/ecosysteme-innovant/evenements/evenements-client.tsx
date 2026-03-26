"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { motion, LayoutGroup } from "framer-motion"
import Image from "next/image"
import { CategoryFilter } from "@/components/category-filter"
import { truncateText } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { Calendar, MapPin, X } from "lucide-react"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
}

interface Evenement {
  id: number
  title: string
  description?: string
  descriptionHtml?: string
  image?: string
  imageAlt?: string
  slug: string
  categoryName?: string
  categorySlug?: string
  dateDeDebut?: string
  dateDeFin?: string
  dateLabel?: string
  venueLabel?: string
  accessType?: string
  eventIcon?: string
  eventColorAccent?: string
  /** ISO month key: "2026-03" */
  monthKey?: string
  /** Display label: "Mars 2026" */
  monthLabel?: string
}

interface EvenementsClientProps {
  categories: Category[]
  evenements: Evenement[]
}

/* ── Tiny SVG blur placeholder ── */

const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 267'%3E%3Crect fill='%23d4d4d4' width='400' height='267'/%3E%3C/svg%3E"

const ALLOWED_IMAGE_HOSTS = ["admin.hermitagelelab.com", "wp-asso.com"]

function isOptimizableUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_IMAGE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

/* ── Format date for display ── */

function formatEventDate(dateStr?: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return dateStr
  }
}

/* ── Month filter ── */

const MonthFilter: React.FC<{
  months: { key: string; label: string }[]
  selected: string | null
  onSelect: (key: string | null) => void
  accentColor: string
}> = ({ months, selected, onSelect, accentColor }) => (
  <div className="flex flex-wrap gap-1">
    <button
      onClick={() => onSelect(null)}
      className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
        selected === null
          ? "bg-stone-800 text-white shadow-lg"
          : "bg-stone-200 text-stone-600 opacity-80 hover:opacity-100"
      }`}
    >
      Tous les mois
    </button>
    {months.map((m) => (
      <button
        key={m.key}
        onClick={() => onSelect(m.key)}
        className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
          selected === m.key
            ? "text-white shadow-lg"
            : "bg-stone-200 text-stone-600 opacity-80 hover:opacity-100"
        }`}
        style={selected === m.key ? { backgroundColor: accentColor } : undefined}
      >
        {m.label}
      </button>
    ))}
  </div>
)

/* ── Collapsed card ── */

const CollapsedCard: React.FC<{
  evenement: Evenement
  color: string
  isPriority: boolean
  onExpand: () => void
}> = ({ evenement, color, isPriority, onExpand }) => {
  const description = evenement.description ? truncateText(evenement.description, 120) : ""

  return (
    <motion.div
      layoutId={`card-${evenement.id}`}
      data-event-card
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md rounded-xl overflow-hidden relative cursor-pointer"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
      onClick={onExpand}
    >
      <div className="px-2 pb-6">
        <motion.h3
          layoutId={`title-${evenement.id}`}
          className="text-xl font-bold mb-2 text-white"
        >
          {evenement.title}
        </motion.h3>

        {/* Date & venue badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(evenement.dateLabel || evenement.dateDeDebut) && (
            <span className="inline-flex items-center gap-1.5 text-xs text-white/90 bg-white/20 rounded-full px-2.5 py-1">
              <Calendar className="w-3 h-3" />
              {evenement.dateLabel || formatEventDate(evenement.dateDeDebut)}
            </span>
          )}
          {evenement.venueLabel && (
            <span className="inline-flex items-center gap-1.5 text-xs text-white/90 bg-white/20 rounded-full px-2.5 py-1">
              <MapPin className="w-3 h-3" />
              {evenement.venueLabel}
            </span>
          )}
        </div>

        <p className="text-white/80 text-sm mb-4 line-clamp-4">{description}</p>

        <span className="inline-flex items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 shadow-sm text-xs h-8 px-4 font-medium">
          Découvrir
        </span>
      </div>
      {evenement.image && (
        <motion.div layoutId={`image-${evenement.id}`}>
          {isOptimizableUrl(evenement.image) ? (
            <Image
              src={evenement.image}
              alt={evenement.imageAlt || evenement.title}
              width={400}
              height={267}
              quality={60}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={isPriority}
              loading={isPriority ? undefined : "lazy"}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="rounded-xl object-cover w-full h-48"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={evenement.image}
              alt={evenement.imageAlt || evenement.title}
              loading={isPriority ? undefined : "lazy"}
              decoding="async"
              className="rounded-xl object-cover w-full h-48"
            />
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ── Expanded card ── */

const ExpandedCard: React.FC<{
  evenement: Evenement
  color: string
  onCollapse: () => void
}> = ({ evenement, color, onCollapse }) => (
  <motion.div
    layoutId={`card-${evenement.id}`}
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

    <div className="flex flex-col lg:flex-row gap-6 px-2 pb-6">
      {/* Left: text content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <motion.h3
          layoutId={`title-${evenement.id}`}
          className="text-2xl font-bold mb-4 text-white"
        >
          {evenement.title}
        </motion.h3>

        <div className="bg-white/60 rounded-xl p-5">
          {/* Date & venue details */}
          <motion.div
            className="flex flex-wrap gap-3 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {(evenement.dateLabel || evenement.dateDeDebut) && (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 bg-white/80 rounded-full px-3 py-1.5">
                <Calendar className="w-4 h-4" />
                {evenement.dateLabel || (
                  <>
                    {formatEventDate(evenement.dateDeDebut)}
                    {evenement.dateDeFin &&
                      evenement.dateDeFin !== evenement.dateDeDebut &&
                      ` — ${formatEventDate(evenement.dateDeFin)}`}
                  </>
                )}
              </span>
            )}
            {evenement.venueLabel && (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 bg-white/80 rounded-full px-3 py-1.5">
                <MapPin className="w-4 h-4" />
                {evenement.venueLabel}
              </span>
            )}
            {evenement.accessType && (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 bg-white/80 rounded-full px-3 py-1.5">
                {evenement.accessType === "gratuit" ? "Gratuit" :
                 evenement.accessType === "payant" ? "Payant" :
                 evenement.accessType === "libre" ? "Prix libre" :
                 evenement.accessType === "adherent" ? "Adhérents" :
                 evenement.accessType}
              </span>
            )}
          </motion.div>

          {/* Description */}
          {evenement.descriptionHtml ? (
            <motion.div
              className="prose prose-sm max-w-none [&_p]:text-stone-900 [&_a]:underline"
              style={{ "--tw-prose-links": color } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(evenement.descriptionHtml) }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            />
          ) : evenement.description ? (
            <motion.p
              className="text-stone-700 text-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              {evenement.description}
            </motion.p>
          ) : null}
        </div>
      </div>

      {/* Right: photo */}
      {evenement.image && (
        <div className="lg:w-1/2 flex flex-col gap-2">
          <motion.div layoutId={`image-${evenement.id}`}>
            {isOptimizableUrl(evenement.image) ? (
              <Image
                src={evenement.image}
                alt={evenement.imageAlt || evenement.title}
                width={640}
                height={400}
                quality={75}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-xl object-cover w-full h-64 lg:h-72"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={evenement.image}
                alt={evenement.imageAlt || evenement.title}
                decoding="async"
                className="rounded-xl object-cover w-full h-64 lg:h-72"
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  </motion.div>
)

/* ── Main grid ── */

export function EvenementsClient({ categories, evenements }: EvenementsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollYBeforeExpand = useRef<number>(0)

  // Extract unique months from events, sorted chronologically
  const availableMonths = useMemo(() => {
    const monthSet = new Map<string, string>()
    evenements.forEach((e) => {
      if (e.monthKey && e.monthLabel && !monthSet.has(e.monthKey)) {
        monthSet.set(e.monthKey, e.monthLabel)
      }
    })
    return Array.from(monthSet.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, label]) => ({ key, label }))
  }, [evenements])

  // Filter by category then by month
  const filteredEvenements = useMemo(() => {
    let filtered = evenements
    if (selectedCategory) {
      filtered = filtered.filter((e) => e.categorySlug === selectedCategory)
    }
    if (selectedMonth) {
      filtered = filtered.filter((e) => e.monthKey === selectedMonth)
    }
    return filtered
  }, [evenements, selectedCategory, selectedMonth])

  // Default color for events without a custom accent
  const defaultColor = "#78AD7D"

  /** Resolve color for a given event: custom accent > category color > default */
  const getEventColor = useCallback(
    (evt: Evenement) => {
      if (evt.eventColorAccent) return evt.eventColorAccent
      if (evt.categorySlug) {
        const cat = categories.find((c) => c.slug === evt.categorySlug)
        if (cat) return cat.color
      }
      return defaultColor
    },
    [categories]
  )

  /** Smooth scroll with custom duration & easing */
  const smoothScrollTo = useCallback((target: number, duration = 600) => {
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
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [])

  const handleExpand = useCallback((id: number) => {
    setExpandedId((prev) => {
      if (prev === id) return prev
      if (prev === null) {
        scrollYBeforeExpand.current = window.scrollY
      }
      return id
    })
  }, [])

  const handleCollapse = useCallback(() => {
    const scrollTarget = scrollYBeforeExpand.current
    setExpandedId(null)
    setTimeout(() => {
      smoothScrollTo(scrollTarget, 500)
    }, 300)
  }, [smoothScrollTo])

  useEffect(() => {
    if (expandedId === null) return
    const timer = setTimeout(() => {
      const el = document.getElementById(`expanded-${expandedId}`)
      if (el) {
        const targetY = el.getBoundingClientRect().top + window.scrollY - 50
        smoothScrollTo(targetY, 250)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [expandedId, smoothScrollTo])

  useEffect(() => {
    if (expandedId === null) return
    function handleClickOutside(e: MouseEvent) {
      const el = document.getElementById(`expanded-${expandedId}`)
      const target = e.target as HTMLElement
      if (target.closest("[data-event-card]")) return
      if (el && !el.contains(target)) {
        handleCollapse()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expandedId, handleCollapse])

  // Collapse expanded card when filters change
  useEffect(() => {
    setExpandedId(null)
  }, [selectedCategory, selectedMonth])

  return (
    <>
      {/* Category filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          onCategoryChange={setSelectedCategory}
          allLabel="Tous les événements"
          allDescription="Découvrez tous les événements à venir à L'Hermitage"
        />
      )}

      {/* Month filter */}
      {availableMonths.length > 0 && (
        <div className="mb-4">
          <MonthFilter
            months={availableMonths}
            selected={selectedMonth}
            onSelect={setSelectedMonth}
            accentColor={defaultColor}
          />
        </div>
      )}

      {/* Empty state */}
      {filteredEvenements.length === 0 && (
        <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Aucun événement trouvé</h3>
          <p className="text-muted-foreground">
            Aucun événement ne correspond aux filtres sélectionnés.
          </p>
        </div>
      )}

      {/* Grid */}
      <LayoutGroup id="evenements-grid">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvenements.map((evt, index) => {
            const isExpanded = evt.id === expandedId
            const color = getEventColor(evt)

            if (isExpanded) {
              return (
                <motion.div
                  key={evt.id}
                  id={`expanded-${evt.id}`}
                  layout
                  className="col-span-1 md:col-span-2 lg:col-span-3"
                  transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
                >
                  <ExpandedCard
                    evenement={evt}
                    color={color}
                    onCollapse={handleCollapse}
                  />
                </motion.div>
              )
            }

            return (
              <motion.div
                key={evt.id}
                layout
                animate={{
                  filter: expandedId !== null ? "opacity(0.7)" : "opacity(1)",
                }}
                transition={{
                  layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                  duration: 0.3,
                }}
              >
                <CollapsedCard
                  evenement={evt}
                  color={color}
                  isPriority={index < 3}
                  onExpand={() => handleExpand(evt.id)}
                />
              </motion.div>
            )
          })}

          {/* Bento filler — md (2-col) */}
          {expandedId === null && filteredEvenements.length % 2 !== 0 && (
            <div
              className="hidden md:flex lg:hidden rounded-xl relative overflow-hidden items-end justify-end p-4"
              style={{ backgroundColor: defaultColor }}
            >
              <Image
                src="/logo-hermitage-new.png"
                alt="L'Hermitage"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          )}


        </div>
      </LayoutGroup>
    </>
  )
}
