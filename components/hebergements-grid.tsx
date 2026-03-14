"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { WPPost, HebergementACF } from "@/lib/wordpress/types"
import { truncateText } from "@/lib/utils"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { X } from "lucide-react"

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
  const truncatedDescription = hebergement.acf?.descriptif
    ? truncateText(hebergement.acf.descriptif, 120)
    : ""
  const { url: imageUrl, alt: imageAlt } = getImage(hebergement)

  return (
    <motion.div
      layoutId={`card-${hebergement.id}`}
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md rounded-xl overflow-hidden relative"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="px-2 pb-6">
        <motion.h3
          layoutId={`title-${hebergement.id}`}
          className="text-xl font-bold mb-3 text-white"
        >
          {hebergement.acf?.nom || hebergement.title.rendered}
        </motion.h3>
        <p className="text-white/80 text-sm mb-3 flex-1 line-clamp-3">{truncatedDescription}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/90 mb-4">
          {hebergement.acf?.capacite_daccueil != null && (
            <span>👥 {hebergement.acf.capacite_daccueil} pers.</span>
          )}
          {hebergement.acf?.repartition_des_chambres && (
            <span>🛏️ {hebergement.acf.repartition_des_chambres}</span>
          )}
          {hebergement.acf?.disponibilite && (
            <span>📅 {hebergement.acf.disponibilite}</span>
          )}
        </div>

        {hebergement.acf?.commodites && (
          <p className="text-white/70 text-xs mb-4 line-clamp-2">
            {hebergement.acf.commodites}
          </p>
        )}

        <Button
          onClick={onExpand}
          size="sm"
          className="rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 shadow-sm text-xs h-8 px-4"
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
            quality={100}
            sizes="(max-width: 768px) 100vw, 33vw"
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
      className="flex flex-col p-2 pt-6 shadow-lg rounded-xl overflow-hidden relative"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
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
        <div className="flex-1 min-w-0">
          <motion.h3
            layoutId={`title-${hebergement.id}`}
            className="text-2xl font-bold mb-4 text-white"
          >
            {hebergement.acf?.nom || hebergement.title.rendered}
          </motion.h3>

          {/* Info badges */}
          <motion.div
            className="flex flex-wrap gap-3 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {hebergement.acf?.capacite_daccueil != null && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white">
                👥 {hebergement.acf.capacite_daccueil} personnes
              </span>
            )}
            {hebergement.acf?.repartition_des_chambres && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white">
                🛏️ {hebergement.acf.repartition_des_chambres}
              </span>
            )}
            {hebergement.acf?.disponibilite && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white">
                📅 {hebergement.acf.disponibilite}
              </span>
            )}
          </motion.div>

          {hebergement.acf?.commodites && (
            <motion.p
              className="text-white/80 text-sm mb-4"
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
              className="prose prose-sm prose-invert max-w-none mb-6 [&_p]:text-white/85 [&_a]:text-white [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(hebergement.acf.descriptif) }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Button
              asChild
              size="sm"
              className="rounded-full bg-white text-stone-800 hover:bg-white/90 shadow-sm text-xs h-8 px-4"
            >
              <Link href={`/hebergement/${hebergement.slug}`}>Voir la fiche complète</Link>
            </Button>
          </motion.div>
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

/* ── Grid: render row by row ── */

const COLS = { sm: 1, md: 2, lg: 3 }

function useColumns() {
  const [cols, setCols] = useState(COLS.lg)

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      setCols(w >= 1024 ? COLS.lg : w >= 768 ? COLS.md : COLS.sm)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return cols
}

function chunkRows<T>(items: T[], cols: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols))
  }
  return rows
}

export function HebergementsGrid({ hebergements }: HebergementsGridProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const expandedRef = useRef<HTMLDivElement>(null)
  const cols = useColumns()

  const handleToggle = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  useEffect(() => {
    if (expandedId !== null && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [expandedId])

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

  const rows = chunkRows(hebergements, cols)

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => {
          const expandedInRow = row.find((h) => h.id === expandedId)

          /* Row has an expanded card → full-width expanded + siblings fade out */
          if (expandedInRow) {
            return (
              <div key={`row-${rowIndex}`} ref={expandedRef}>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {/* Siblings fade/shrink out */}
                  <AnimatePresence>
                    {row
                      .filter((h) => h.id !== expandedId)
                      .map((h) => (
                        <motion.div
                          key={h.id}
                          initial={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.25 }}
                          className="pointer-events-none"
                        />
                      ))}
                  </AnimatePresence>
                </div>
                {/* Expanded card takes full row */}
                <ExpandedCard
                  hebergement={expandedInRow}
                  color={BRAND_COLORS.rose}
                  onCollapse={() => setExpandedId(null)}
                />
              </div>
            )
          }

          /* Normal row → grid of collapsed cards */
          return (
            <motion.div
              key={`row-${rowIndex}`}
              layout
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
            >
              <AnimatePresence mode="popLayout">
                {row.map((hebergement) => (
                  <motion.div
                    key={hebergement.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CollapsedCard
                      hebergement={hebergement}
                      color={BRAND_COLORS.rose}
                      onExpand={() => handleToggle(hebergement.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
