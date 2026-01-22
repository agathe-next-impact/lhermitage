"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { WPPost, HebergementACF } from "@/lib/wordpress/types"
import { getCategoryColor } from "@/lib/wordpress/category-colors"

import "@/components/ui/MagicBento.css"

interface HebergementsGridProps {
  hebergements: WPPost<HebergementACF>[]
}

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>
  spotlightRadius?: number
  glowColor?: string
}> = ({ gridRef, spotlightRadius = 300, glowColor = "229, 87, 84" }) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null)
  return null
}

export function HebergementsGrid({ hebergements }: HebergementsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  const getBentoClass = (index: number) => {
    const pattern = index % 6
    switch (pattern) {
      case 0:
        return "md:col-span-2 md:row-span-2" // Large square
      case 1:
        return "md:col-span-2 md:row-span-1" // Wide rectangle
      case 2:
        return "md:col-span-2 md:row-span-1" // Wide rectangle
      case 3:
        return "md:col-span-2 md:row-span-1" // Wide rectangle
      case 4:
        return "md:col-span-2 md:row-span-2" // Large square
      case 5:
        return "md:col-span-2 md:row-span-1" // Wide rectangle
      default:
        return "md:col-span-2 md:row-span-1"
    }
  }

  if (!hebergements || hebergements.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground mb-2">Aucun hébergement trouvé.</p>
        <p className="text-sm text-muted-foreground">
          Vérifiez que des posts de type "hebergement" existent dans WordPress.
        </p>
      </div>
    )
  }

  return (
    <>
      <GlobalSpotlight gridRef={gridRef} spotlightRadius={300} glowColor="229, 87, 84" />

      <div
        ref={gridRef}
        className="card-grid bento-section grid grid-cols-1 md:grid-cols-6 auto-rows-[400px] md:auto-rows-[280px] md:grid-flow-dense gap-6"
      >
        {/* Real hebergement cards */}
        {hebergements.map((hebergement, index) => {
          const categorySlug = hebergement._embedded?.["wp:term"]?.[0]?.[0]?.slug
          const categoryColor = categorySlug ? getCategoryColor(categorySlug) : "#e75754"
          const bentoClass = getBentoClass(index)

          return (
            <div
              key={hebergement.id}
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
              {(hebergement.acf?.photos?.[0]?.url || hebergement._embedded?.["wp:featuredmedia"]?.[0]) && (
                <div className="absolute inset-0">
                  <Image
                    src={
                      hebergement.acf?.photos?.[0]?.url ||
                      hebergement._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={
                      hebergement.acf?.photos?.[0]?.alt ||
                      hebergement._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
                      hebergement.title.rendered
                    }
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    quality={70}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
              )}

              {/* Content Container */}
              <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-t-3xl p-6 transform translate-y-[calc(100%-100px)] transition-transform duration-700 ease-out group-hover:translate-y-0 z-20 h-full flex flex-col">
                <div className="flex-shrink-0">
                  <h3 className="text-xl font-bold line-clamp-2" style={{ color: categoryColor }}>
                    {hebergement.acf?.nom || hebergement.title.rendered}
                  </h3>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4 flex-grow flex flex-col">
                  {hebergement.acf?.descriptif && (
                    <div
                      className="prose prose-sm line-clamp-6 text-gray-700 mb-4"
                      dangerouslySetInnerHTML={{ __html: hebergement.acf.descriptif }}
                    />
                  )}

                  <div className="flex-grow" />

                  <Button
                    asChild
                    className="w-full rounded-full text-white transition-colors mt-auto flex-shrink-0 hover:opacity-90"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <Link href={`/hebergement/${hebergement.slug}`}>Découvrir</Link>
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
