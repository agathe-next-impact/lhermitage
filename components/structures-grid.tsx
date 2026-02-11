"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { WPPost, StructureACF } from "@/lib/wordpress/types"
import { getCategoryColor } from "@/lib/wordpress/category-colors"
import { truncateText } from "@/lib/utils"
import { sanitizeUrl } from "@/lib/wordpress/sanitize"
import {
  MinimalCard,
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
} from "@/components/ui/minimal-card"
import { BRAND_COLORS } from "@/lib/theme/colors"

import "@/components/ui/MagicBento.css"

interface StructuresGridProps {
  structures: WPPost<StructureACF>[]
}

// -----------------------------------------------------------------------------
// Helper: Simulation to count needed fillers
// -----------------------------------------------------------------------------
function getFillerCount(count: number): number {
  // Grid width in "slots". 1 slot = 2 columns.
  // The layout is md:grid-cols-6, so 3 slots wide.
  const GRID_WIDTH = 3 
  
  // Track occupied cells: grid[row][col] = true if occupied
  const grid: Record<number, Record<number, boolean>> = {}

  // Helpers
  const isFree = (r: number, c: number) => !grid[r]?.[c]
  const mark = (r: number, c: number) => {
    if (!grid[r]) grid[r] = {}
    grid[r][c] = true
  }

  let maxRow = -1

  // Place each item to calculate geometry
  for (let i = 0; i < count; i++) {
    const pattern = i % 6
    // Indexes 0 and 4 are "Large" (1x2 slots), others "Small" (1x1 slot)
    const isLarge = pattern === 0 || pattern === 4

    let placed = false
    let r = 0
    while (!placed) {
      // Find first column in row r that fits
      for (let c = 0; c < GRID_WIDTH; c++) {
        // If Large, need (r,c) and (r+1,c)
        if (isLarge) {
          if (isFree(r, c) && isFree(r + 1, c)) {
            mark(r, c)
            mark(r + 1, c)
            maxRow = Math.max(maxRow, r + 1)
            placed = true
            break
          }
        } 
        // If Small, need (r,c)
        else {
          if (isFree(r, c)) {
            mark(r, c)
            maxRow = Math.max(maxRow, r)
            placed = true
            break
          }
        }
      }
      if (!placed) r++
    }
  }

  // Count holes in the bounding box (0..maxRow, 0..GRID_WIDTH-1)
  let holes = 0
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      if (isFree(r, c)) {
        holes++
      }
    }
  }

  return holes
}

const FillerCard = ({ index }: { index: number }) => {
  const colors = [
    BRAND_COLORS.coral,
    BRAND_COLORS.teal,
    BRAND_COLORS.green,
    BRAND_COLORS.rose,
    BRAND_COLORS.orange,
    BRAND_COLORS.darkBlue,
  ]
  const color = colors[index % colors.length]

  return (
    <div
      className="hidden md:flex md:col-span-2 md:row-span-1 rounded-xl items-center justify-center relative overflow-hidden shadow-sm"
      style={{ backgroundColor: color }}
    >
       <Image
         src="/logo-hermitage-new.png"
         alt=""
         width={80}
         height={80}
         className="opacity-20 brightness-0 invert object-contain"
       />
    </div>
  )
}

const StructureCard: React.FC<{
  structure: WPPost<StructureACF>
  categoryColor: string
  bentoClass: string
  truncatedDescription: string
  featuredImageUrl: string | undefined
  backgroundImageUrl: string | undefined
}> = ({ structure, categoryColor, bentoClass, truncatedDescription, featuredImageUrl, backgroundImageUrl }) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [titleLines, setTitleLines] = useState(1)

  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = Number.parseFloat(getComputedStyle(titleRef.current).lineHeight)
      const height = titleRef.current.offsetHeight
      const lines = Math.round(height / lineHeight)
      setTitleLines(lines)
    }
  }, [structure.title.rendered])

  const excerptLineClamp = titleLines >= 2 ? "line-clamp-2" : "line-clamp-3"

  return (
    <MinimalCard className={`${bentoClass} group h-full`}>
      <div className="absolute left-2 right-2 top-2 h-36 rounded-xl overflow-hidden shadow-sm bg-neutral-100 group-hover:shadow-md transition-all duration-300">
        <Image
          src={backgroundImageUrl || "/placeholder.svg"}
          alt={structure.title.rendered}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-col h-full p-4 pt-[10.5rem]">
        <MinimalCardTitle ref={titleRef} style={{ color: categoryColor }} className="mb-2 line-clamp-1">
          {structure.acf?.nom || structure.title.rendered}
        </MinimalCardTitle>
        <MinimalCardDescription className={`mb-3 flex-1 ${excerptLineClamp} text-neutral-600 dark:text-neutral-400`}>
          {truncatedDescription}
        </MinimalCardDescription>

        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            className="flex-1 rounded-full text-white transition-colors hover:opacity-90 shadow-sm text-xs h-8"
            style={{ backgroundColor: categoryColor }}
          >
            <Link href={`/structure/${structure.slug}`}>Voir</Link>
          </Button>

          {structure.acf?.lien?.url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 rounded-full transition-colors hover:bg-neutral-100 bg-transparent text-xs h-8 px-2"
              style={{ borderColor: categoryColor, color: categoryColor }}
            >
              <a href={sanitizeUrl(structure.acf.lien.url)} target="_blank" rel="noopener noreferrer">
                {structure.acf.lien.title || "Site web"}
              </a>
            </Button>
          )}
        </div>
      </div>
    </MinimalCard>
  )
}

export function StructuresGrid({ structures }: StructuresGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  const getBentoClass = (index: number) => {
    const pattern = index % 6
    switch (pattern) {
      case 0:
        return "md:col-span-2 md:row-span-2"
      case 1:
        return "md:col-span-2 md:row-span-1"
      case 2:
        return "md:col-span-2 md:row-span-1"
      case 3:
        return "md:col-span-2 md:row-span-1"
      case 4:
        return "md:col-span-2 md:row-span-2"
      case 5:
        return "md:col-span-2 md:row-span-1"
      default:
        return "md:col-span-2 md:row-span-1"
    }
  }

  const getCardHeight = (index: number): "small" | "large" => {
    const pattern = index % 6
    return pattern === 0 || pattern === 4 ? "large" : "small"
  }

  return (
    <>
      <div
        ref={gridRef}
        className="card-grid bento-section grid grid-cols-1 md:grid-cols-6 auto-rows-[400px] md:auto-rows-[280px] md:grid-flow-dense gap-6"
      >
        {structures.map((structure, index) => {
          const categorySlug = structure._embedded?.["wp:term"]?.[0]?.[0]?.slug
          const categoryColor = categorySlug ? getCategoryColor(categorySlug) : "#e75754"
          const bentoClass = getBentoClass(index)
          const cardHeight = getCardHeight(index)
          const truncatedDescription = structure.acf?.descriptif
            ? truncateText(structure.acf.descriptif, cardHeight === "large" ? 250 : 120)
            : ""

          const featuredImageUrl = structure.featured_media_url || structure.acf?.photos?.[0]?.url
          const backgroundImageUrl = structure.acf?.photos?.[1]?.url || structure.acf?.photos?.[0]?.url

          return (
            <StructureCard
              key={structure.id}
              structure={structure}
              categoryColor={categoryColor}
              bentoClass={bentoClass}
              truncatedDescription={truncatedDescription}
              featuredImageUrl={featuredImageUrl}
              backgroundImageUrl={backgroundImageUrl}
            />
          )
        })}

        {/* Fillers to complete the rectangle */}
        {Array.from({ length: getFillerCount(structures.length) }).map((_, i) => (
          <FillerCard key={`filler-${i}`} index={i} />
        ))}
      </div>
    </>
  )
}
