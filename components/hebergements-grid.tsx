"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, LayoutGroup } from "framer-motion"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { WPPost, HebergementACF } from "@/lib/wordpress/types"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { X, Users, BedDouble, CalendarDays } from "lucide-react"

interface HebergementsGridProps {
  hebergements: WPPost<HebergementACF>[]
}

/* ── Shared helpers ── */

function getImage(h: WPPost<HebergementACF>) {
  return {
    url:
      h.acf?.photos?.[0]?.url ||
      h._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    alt:
      h.acf?.photos?.[0]?.alt ||
      h._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
      h.title.rendered,
  }
}

/* ── Collapsed card ── */

const CollapsedCard: React.FC<{
  hebergement: WPPost<HebergementACF>
  color: string
  onExpand: () => void
}> = ({ hebergement, color, onExpand }) => {
  const { url: imageUrl, alt: imageAlt } = getImage(hebergement)

  return (
    <motion.div
      layoutId={`card-${hebergement.id}`}
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md rounded-xl overflow-hidden relative bg-brand-green"
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="px-2 pb-6 flex flex-col items-start gap-3">
        <motion.h3
          layoutId={`title-${hebergement.id}`}
          className="text-2xl font-bold text-white"
        >
          {hebergement.acf?.nom || hebergement.title.rendered}
        </motion.h3>

        {hebergement.acf?.capacite_daccueil != null && (
          <span className="text-sm text-white/90 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {hebergement.acf.capacite_daccueil} pers.
          </span>
        )}

        <Button
          onClick={onExpand}
          size="sm"
          className="rounded-full bg-white text-brand-green font-semibold transition-colors hover:bg-white/90 shadow-md text-sm h-9 px-6"
        >
          Découvrir
        </Button>
      </div>
      {imageUrl && (
        <motion.div layoutId={`image-${hebergement.id}`}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={600}
            height={400}
            quality={80}
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            className="rounded-xl object-cover w-full h-48"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

/* ── Expanded card (full row width) ── */

const ExpandedCard: React.FC<{
  hebergement: WPPost<HebergementACF>
  color: string
  onCollapse: () => void
}> = ({ hebergement, color, onCollapse }) => {
  const { url: imageUrl, alt: imageAlt } = getImage(hebergement)

  return (
    <motion.div
      layoutId={`card-${hebergement.id}`}
      className="flex flex-col p-2 pt-6 shadow-lg rounded-xl overflow-hidden relative bg-brand-green"
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
            layoutId={`title-${hebergement.id}`}
            className="text-2xl font-bold mb-4 text-white"
          >
            {hebergement.acf?.nom || hebergement.title.rendered}
          </motion.h3>

          <div className="bg-white rounded-xl p-5">
            {/* Info badges */}
            <motion.div
              className="flex flex-wrap gap-3 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              {hebergement.acf?.capacite_daccueil != null && (
                <span className="inline-flex items-center gap-1.5 bg-brand-green/10 rounded-full px-3 py-1.5 text-sm text-stone-700">
                  <Users className="w-4 h-4" /> {hebergement.acf.capacite_daccueil} personnes
                </span>
              )}
              {hebergement.acf?.repartition_des_chambres && (
                <span className="inline-flex items-center gap-1.5 bg-brand-green/10 rounded-full px-3 py-1.5 text-sm text-stone-700">
                  <BedDouble className="w-4 h-4" /> {hebergement.acf.repartition_des_chambres}
                </span>
              )}
              {hebergement.acf?.disponibilite && (
                <span className="inline-flex items-center gap-1.5 bg-brand-green/10 rounded-full px-3 py-1.5 text-sm text-stone-700">
                  <CalendarDays className="w-4 h-4" /> {hebergement.acf.disponibilite}
                </span>
              )}
            </motion.div>

            {hebergement.acf?.commodites && (
              <motion.p
                className="text-stone-600 text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {hebergement.acf.commodites}
              </motion.p>
            )}

            {/* Full description */}
            {hebergement.acf?.descriptif && (
              <motion.div
                className="prose prose-sm max-w-none [&_p]:text-stone-700 [&_a]:text-brand-green [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(hebergement.acf.descriptif) }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              />
            )}
          </div>

        </div>

        {/* Right: photos */}
        <div className="lg:w-1/2 flex flex-col gap-2">
          {imageUrl && (
            <motion.div layoutId={`image-${hebergement.id}`}>
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={800}
                height={500}
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-xl object-cover w-full h-64 lg:h-72"
              />
            </motion.div>
          )}
          {hebergement.acf?.photos && hebergement.acf.photos.length > 1 && (
            <motion.div
              className="grid grid-cols-3 gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2, duration: 0.35 }}
            >
              {hebergement.acf.photos.slice(1, 4).map((photo, i) => (
                <Image
                  key={photo.id ?? i}
                  src={photo.url}
                  alt={photo.alt || `Photo ${i + 2}`}
                  width={300}
                  height={200}
                  sizes="(max-width: 1024px) 33vw, 16vw"
                  quality={75}
                  loading="lazy"
                  className="rounded-lg object-cover w-full h-24 lg:h-28"
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Grid ── */

export function HebergementsGrid({ hebergements }: HebergementsGridProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollYBeforeExpand = useRef<number>(0)

  /** Smooth scroll with custom duration & easing via rAF */
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
      // Only save scroll position when opening from fully closed state
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
        const targetY = el.getBoundingClientRect().top + window.scrollY
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
      // Don't close if clicking a "Découvrir" button on another card
      if (target.closest("button")?.textContent?.includes("Découvrir")) return
      if (el && !el.contains(target)) {
        handleCollapse()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expandedId, handleCollapse])

  if (!hebergements || hebergements.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground mb-2">Aucun hébergement trouvé.</p>
        <p className="text-sm text-muted-foreground">
          Vérifiez que des posts de type &quot;hebergement&quot; existent dans WordPress.
        </p>
      </div>
    )
  }

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {hebergements.map((hebergement) => {
          const isExpanded = hebergement.id === expandedId

          if (isExpanded) {
            return (
              <motion.div
                key={hebergement.id}
                id={`expanded-${hebergement.id}`}
                layout
                className="col-span-1 md:col-span-2 lg:col-span-3"
                transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
              >
                <ExpandedCard
                  hebergement={hebergement}
                  color={BRAND_COLORS.rose}
                  onCollapse={handleCollapse}
                />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={hebergement.id}
              layout
              animate={{
                filter: expandedId !== null ? "opacity(0.7)" : "opacity(1)",
              }}
              transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, duration: 0.3 }}
            >
              <CollapsedCard
                hebergement={hebergement}
                color={BRAND_COLORS.rose}
                onExpand={() => handleExpand(hebergement.id)}
              />
            </motion.div>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
