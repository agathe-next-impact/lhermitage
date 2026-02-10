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

import "@/components/ui/MagicBento.css"

interface StructuresGridProps {
  structures: WPPost<StructureACF>[]
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
    <div
      className={`magic-bento-card magic-bento-card--border-glow group relative overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${bentoClass}`}
      style={
        {
          "--glow-color":
            categoryColor
              .replace("#", "")
              .match(/.{2}/g)
              ?.map((x) => Number.parseInt(x, 16))
              .join(", ") || "229, 87, 84",
        } as React.CSSProperties
      }
    >
      {/* Background Image */}
      {backgroundImageUrl && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImageUrl || "/placeholder.svg"}
            alt={structure.title.rendered}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            quality={70}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      )}

      {/* Content Container - slides up on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-t-3xl px-4 pt-3 pb-2 transform translate-y-[calc(100%-140px)] transition-transform duration-700 ease-out group-hover:translate-y-0 z-20 h-full flex flex-col">
        <div className="pb-2">
          {featuredImageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden mx-auto w-1/2 max-w-[100px]">
              <Image
                src={featuredImageUrl || "/placeholder.svg"}
                alt={structure.title.rendered}
                width={100}
                height={60}
                className="w-full h-[60px] object-contain bg-gray-50"
                sizes="100px"
              />
            </div>
          )}
          <h3 ref={titleRef} className="text-xl font-bold line-clamp-2 leading-tight" style={{ color: categoryColor }}>
            {structure.acf?.nom || structure.title.rendered}
          </h3>
        </div>

        {/* Description and button - fade in on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 flex flex-col min-h-0 mt-1">
          {truncatedDescription && (
            <p className={`text-sm text-gray-700 flex-1 mb-3 overflow-hidden ${excerptLineClamp}`}>
              {truncatedDescription}
            </p>
          )}

          {/* CTAs fixed at bottom */}
          <div className="space-y-2 flex-shrink-0 pt-2">
            <Button
              asChild
              className="w-full rounded-full text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: categoryColor }}
            >
              <Link href={`/structure/${structure.slug}`}>Voir la fiche</Link>
            </Button>

            {structure.acf?.lien?.url && (
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full transition-colors hover:bg-gray-50 bg-transparent"
                style={{ borderColor: categoryColor, color: categoryColor }}
              >
                <a href={sanitizeUrl(structure.acf.lien.url)} target="_blank" rel="noopener noreferrer">
                  {structure.acf.lien.title || "Site web"}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
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
      </div>
    </>
  )
}
