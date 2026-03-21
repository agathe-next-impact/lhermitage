"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, LayoutGroup } from "framer-motion"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import type { WPPost, WPImage, StructureACF } from "@/lib/wordpress/types"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { sanitizeHtml, sanitizeUrl } from "@/lib/wordpress/sanitize"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { X } from "lucide-react"

interface SectionData {
  titre_de_section?: string
  image_de_section?: WPImage
}

interface StructuresGridProps {
  structures: WPPost<StructureACF>[]
  sectionInternes?: SectionData
  sectionHebergees?: SectionData
}

/* ── Shared helpers ── */

function getImage(s: WPPost<StructureACF>) {
  return {
    url:
      s.acf?.photos?.[0]?.url ||
      s._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    alt:
      s.acf?.photos?.[0]?.alt ||
      s._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
      s.title.rendered,
  }
}

/* ── Collapsed card ── */

const CollapsedCard: React.FC<{
  structure: WPPost<StructureACF>
  color: string
  onExpand: () => void
}> = ({ structure, color, onExpand }) => {
  const { url: imageUrl, alt: imageAlt } = getImage(structure)

  return (
    <motion.div
      layoutId={`structure-card-${structure.id}`}
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md rounded-xl overflow-hidden relative cursor-pointer"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
      data-structure-card
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onExpand() }}
    >
      <div className="px-2 pb-6 flex flex-col items-start gap-3">
        <motion.h3
          layoutId={`structure-title-${structure.id}`}
          className="text-2xl font-bold text-white"
        >
          {structure.acf?.nom || structure.title.rendered}
        </motion.h3>

        <Button
          onClick={onExpand}
          size="sm"
          className="rounded-full bg-white text-stone-700 font-semibold transition-colors hover:bg-white/90 shadow-md text-sm h-9 px-6"
        >
          Découvrir
        </Button>
      </div>
      {imageUrl && (
        <motion.div layoutId={`structure-image-${structure.id}`}>
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
  structure: WPPost<StructureACF>
  color: string
  onCollapse: () => void
}> = ({ structure, color, onCollapse }) => {
  const { url: imageUrl, alt: imageAlt } = getImage(structure)

  return (
    <motion.div
      layoutId={`structure-card-${structure.id}`}
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
            layoutId={`structure-title-${structure.id}`}
            className="text-2xl font-bold mb-4 text-white"
          >
            {structure.acf?.nom || structure.title.rendered}
          </motion.h3>

          <div className="bg-white/60 rounded-xl p-5">
            {/* Full description */}
            {structure.acf?.descriptif && (
              <motion.div
                className="prose prose-sm max-w-none [&_p]:text-stone-900 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(structure.acf.descriptif) }}
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
            <motion.div layoutId={`structure-image-${structure.id}`}>
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
          {structure.acf?.photos && structure.acf.photos.length > 1 && (
            <motion.div
              className="grid grid-cols-3 gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2, duration: 0.35 }}
            >
              {structure.acf.photos.slice(1, 4).map((photo, i) => (
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

/* ── Section grid with expand/collapse logic ── */

function StructuresSectionGrid({
  structures,
  color,
}: {
  structures: WPPost<StructureACF>[]
  color: string
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollYBeforeExpand = useRef<number>(0)
  const scrollRafId = useRef<number>(0)

  const cancelScroll = useCallback(() => {
    if (scrollRafId.current) {
      cancelAnimationFrame(scrollRafId.current)
      scrollRafId.current = 0
    }
  }, [])

  const smoothScrollTo = useCallback((target: number, duration = 600) => {
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
  }, [cancelScroll])

  const handleExpand = useCallback((id: number) => {
    cancelScroll()
    setExpandedId((prev) => {
      if (prev === id) return prev
      if (prev === null) {
        scrollYBeforeExpand.current = window.scrollY
      }
      return id
    })
  }, [cancelScroll])

  const handleCollapse = useCallback(() => {
    cancelScroll()
    const scrollTarget = scrollYBeforeExpand.current
    setExpandedId(null)
    setTimeout(() => {
      smoothScrollTo(scrollTarget, 500)
    }, 300)
  }, [cancelScroll, smoothScrollTo])

  useEffect(() => {
    if (expandedId === null) return
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`structure-expanded-${expandedId}`)
        if (el) {
          const offset = 50
          const targetY = el.getBoundingClientRect().top + window.scrollY - offset
          smoothScrollTo(targetY, 350)
        }
      })
    }, 280)
    return () => clearTimeout(timer)
  }, [expandedId, smoothScrollTo])

  useEffect(() => cancelScroll, [cancelScroll])

  useEffect(() => {
    if (expandedId === null) return
    function handleClickOutside(e: MouseEvent) {
      const el = document.getElementById(`structure-expanded-${expandedId}`)
      const target = e.target as HTMLElement
      if (target.closest("[data-structure-card]")) return
      if (el && !el.contains(target)) {
        handleCollapse()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expandedId, handleCollapse])

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 pl-2">
        {structures.map((structure) => {
          const isExpanded = structure.id === expandedId

          if (isExpanded) {
            return (
              <motion.div
                key={structure.id}
                id={`structure-expanded-${structure.id}`}
                layout
                className="col-span-1 md:col-span-2 lg:col-span-3"
                transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
              >
                <ExpandedCard
                  structure={structure}
                  color={color}
                  onCollapse={handleCollapse}
                />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={structure.id}
              layout
              animate={{
                filter: expandedId !== null ? "opacity(0.7)" : "opacity(1)",
              }}
              transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, duration: 0.3 }}
            >
              <CollapsedCard
                structure={structure}
                color={color}
                onExpand={() => handleExpand(structure.id)}
              />
            </motion.div>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

/* ── Main export ── */

export function StructuresGrid({
  structures,
  sectionInternes,
  sectionHebergees,
}: StructuresGridProps) {
  const internalStructures = structures.filter((s) => s.acf?.type_de_structure == "interne")
  const hostedStructures = structures.filter((s) => s.acf?.type_de_structure == "hebergee")

  return (
    <div className="space-y-8">
      {internalStructures.length > 0 && (
        <BentoHeaderContent
          title={sectionInternes?.titre_de_section || "Structures internes"}
          color={BRAND_COLORS.rose}
          columnImage={sectionInternes?.image_de_section?.url}
        >
          <StructuresSectionGrid
            structures={internalStructures}
            color={BRAND_COLORS.rose}
          />
        </BentoHeaderContent>
      )}

      {hostedStructures.length > 0 && (
        <BentoHeaderContent
          title={sectionHebergees?.titre_de_section || "Structures hébergées"}
          color={BRAND_COLORS.teal}
          columnImage={sectionHebergees?.image_de_section?.url}
        >
          <StructuresSectionGrid
            structures={hostedStructures}
            color={BRAND_COLORS.teal}
          />
        </BentoHeaderContent>
      )}
    </div>
  )
}
