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
import { cn } from "@/lib/utils"

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
    // Pattern mirrors getBentoClass logic:
    // 0: Large (row-span-3) -> 3 slots vert
    // 4: Large (row-span-3) -> 3 slots vert
    // Others: Small (row-span-2) -> 2 slots vert
    const isLarge = pattern === 0 || pattern === 4
    const height = isLarge ? 3 : 2

    let placed = false
    let r = 0
    while (!placed) {
      // Find first column in row r that fits
      for (let c = 0; c < GRID_WIDTH; c++) {
        // Check if all needed slots are free
        let fits = true
        for (let h = 0; h < height; h++) {
          if (!isFree(r + h, c)) {
            fits = false
            break
          }
        }

        if (fits) {
          // Mark all slots
          for (let h = 0; h < height; h++) {
            mark(r + h, c)
          }
          maxRow = Math.max(maxRow, r + height)
          placed = true
          break
        }
      }
      if (!placed) r++
    }
  }

  // Count holes in the bounding box (0..maxRow, 0..GRID_WIDTH-1)
  let holes = 0
  
  // Create slots for holes. Each filler is effectively a "Small" card (row-span-2).
  // However, counting "holes" is tricky because holes might be 1-slot high or irregular.
  // The simple approach: Count total empty 1x1 blocks, divide by 2 (height of filler).
  let emptyBlocks = 0
  for (let r = 0; r < maxRow; r++) { // Iterate up to maxRow used
    for (let c = 0; c < GRID_WIDTH; c++) {
      if (isFree(r, c)) {
        emptyBlocks++
      }
    }
  }

  // Assuming we fill with 2-row-high cards.
  return Math.ceil(emptyBlocks / 2)
}

const BrandCard = ({ index, className }: { index: number; className?: string }) => {
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
      className={cn(
        "rounded-xl items-center justify-center relative overflow-hidden shadow-sm flex",
        className || "hidden md:flex md:col-span-2 md:row-span-2"
      )}
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
  imageObjectFit?: "cover" | "contain"
}> = ({
  structure,
  categoryColor,
  bentoClass,
  truncatedDescription,
  featuredImageUrl,
  backgroundImageUrl,
  imageObjectFit = "cover",
}) => {
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
    <MinimalCard className={`${bentoClass} group h-full flex flex-col pt-2 px-2 pb-0`}>
      <div className="relative flex-1 w-full rounded-xl overflow-hidden shadow-sm bg-neutral-100 group-hover:shadow-md transition-all duration-300">
        <Image
          src={backgroundImageUrl || "/placeholder.svg"}
          alt={structure.title.rendered}
          fill
          className={`${imageObjectFit === "cover" ? "object-cover" : "object-contain p-4"} transition-transform duration-500 group-hover:scale-105`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-col shrink-0 p-4">
        <MinimalCardTitle ref={titleRef} style={{ color: categoryColor }} className="mb-2 line-clamp-1">
          {structure.acf?.nom || structure.title.rendered}
        </MinimalCardTitle>
        <MinimalCardDescription className={`mb-3 ${excerptLineClamp} text-neutral-600 dark:text-neutral-400`}>
          {truncatedDescription}
        </MinimalCardDescription>

        <div className="flex gap-2 mt-auto">
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

const InternalStructureCard: React.FC<{
  structure: WPPost<StructureACF>
  categoryColor: string
}> = ({ structure, categoryColor }) => {
  const truncatedDescription = structure.acf?.descriptif
    ? truncateText(structure.acf.descriptif, 120)
    : ""

  return (
    <MinimalCard className="h-full flex flex-col p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold mb-3" style={{ color: categoryColor }}>
        {structure.acf?.nom || structure.title.rendered}
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 flex-1 line-clamp-4">
        {truncatedDescription}
      </p>
      
      <div className="flex gap-2">
        <Button
          asChild
          size="sm"
          className="rounded-full text-white transition-colors hover:opacity-90 shadow-sm text-xs h-8 px-4"
          style={{ backgroundColor: categoryColor }}
        >
          <Link href={`/structure/${structure.slug}`}>Voir</Link>
        </Button>

        {structure.acf?.lien?.url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full transition-colors hover:bg-neutral-100 bg-transparent text-xs h-8 px-4"
              style={{ borderColor: categoryColor, color: categoryColor }}
            >
              <a href={sanitizeUrl(structure.acf.lien.url)} target="_blank" rel="noopener noreferrer">
                {structure.acf.lien.title || "Site web"}
              </a>
            </Button>
          )}
      </div>
    </MinimalCard>
  )
}

export function StructuresGrid({ structures }: StructuresGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  const internalStructures = structures.filter((s) => s.acf?.type_de_structure === "interne")
  const hostedStructures = structures.filter((s) => s.acf?.type_de_structure !== "interne")

  const getBentoClass = (index: number) => {
    const pattern = index % 6
    switch (pattern) {
      case 0:
        return "md:col-span-2 md:row-span-3"
      case 1:
        return "md:col-span-2 md:row-span-2"
      case 2:
        return "md:col-span-2 md:row-span-2"
      case 3:
        return "md:col-span-2 md:row-span-2"
      case 4:
        return "md:col-span-2 md:row-span-3"
      case 5:
        return "md:col-span-2 md:row-span-2"
      default:
        return "md:col-span-2 md:row-span-2"
    }
  }

  const getCardHeight = (index: number): "small" | "large" => {
    const pattern = index % 6
    // Pattern mirrors above: 0 and 4 are large
    return pattern === 0 || pattern === 4 ? "large" : "small"
  }

  // Create a mixed list of items: Structures interspersed with BrandCards every 3 items
  const gridItems: ({ type: "structure"; data: WPPost<StructureACF> } | { type: "brand"; id: string })[] = []
  
  hostedStructures.forEach((structure, i) => {
    gridItems.push({ type: "structure", data: structure })
    // Insert brand card after every 3 structures (indices 0,1,2 -> insert after 2)
    // Avoid inserting if it's the very last item? Or keep it for consistency? 
    // "toutes les 3 cartes" implies a flow.
    if ((i + 1) % 3 === 0) {
      gridItems.push({ type: "brand", id: `brand-${i}` })
    }
  })

  return (
    <div className="space-y-16">
      {/* Internal Structures Section */}
      {internalStructures.length > 0 && (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internalStructures.map((structure) => {
              const categorySlug = structure._embedded?.["wp:term"]?.[0]?.[0]?.slug
              const categoryColor = categorySlug ? getCategoryColor(categorySlug) : "#e75754"
              
              return (
                <InternalStructureCard
                  key={structure.id}
                  structure={structure}
                  categoryColor={categoryColor}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Hosted Structures Section (Bento Grid) */}
      <div
        ref={gridRef}
        className="card-grid bento-section grid grid-cols-1 md:grid-cols-3 auto-rows-[400px] md:auto-rows-[140px] md:grid-flow-dense gap-6"
      >
        {gridItems.map((item, index) => {
          const bentoClass = getBentoClass(index)

          if (item.type === "brand") {
            return <BrandCard key={item.id} index={index} className={bentoClass} />
          }

          const structure = item.data
          const categorySlug = structure._embedded?.["wp:term"]?.[0]?.[0]?.slug
          const categoryColor = categorySlug ? getCategoryColor(categorySlug) : "#e75754"
          
          const cardHeight = getCardHeight(index)
          const truncatedDescription = structure.acf?.descriptif
            ? truncateText(structure.acf.descriptif, cardHeight === "large" ? 250 : 120)
            : ""

          const featuredImageUrl = structure.featured_media_url || structure.acf?.photos?.[0]?.url
          const backgroundImageUrl = structure.featured_media_url || structure.acf?.photos?.[0]?.url || structure.acf?.photos?.[1]?.url

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
        {Array.from({ length: getFillerCount(gridItems.length) }).map((_, i) => (
          <BrandCard key={`filler-${i}`} index={gridItems.length + i} />
        ))}
      </div>
    </div>
  )
}
