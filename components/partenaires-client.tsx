"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import type { WPPost, PartenaireACF, WPTerm } from "@/lib/wordpress/types"
import { cn } from "@/lib/utils"
import { sanitizeUrl } from "@/lib/wordpress/sanitize"
import { MinimalCard } from "@/components/ui/minimal-card"
import { useIsMounted } from "@/hooks/use-is-mounted"

interface PartenairesClientProps {
  partenaires: WPPost<PartenaireACF>[]
  categories: WPTerm[]
}

const CATEGORY_COLORS = [
  {
    selected: "bg-[#56939f] text-white border-[#56939f] hover:bg-[#56939f]", // brand-teal
    outline: "bg-[#56939f]/80 text-white border-[#56939f] hover:bg-[#56939f]",
  },
  {
    selected: "bg-[#78ad7d] text-white border-[#78ad7d] hover:bg-[#78ad7d]", // brand-green
    outline: "bg-[#78ad7d]/80 text-white border-[#78ad7d] hover:bg-[#78ad7d]",
  },
  {
    selected: "bg-[#c14c66] text-white border-[#c14c66] hover:bg-[#c14c66]", // brand-pink
    outline: "bg-[#c14c66]/80 text-white border-[#c14c66] hover:bg-[#c14c66]",
  },
  {
    selected: "bg-[#dc6f45] text-white border-[#dc6f45] hover:bg-[#dc6f45]", // brand-orange
    outline: "bg-[#dc6f45]/80 text-white border-[#dc6f45] hover:bg-[#dc6f45]",
  },
  {
    selected: "bg-[#2a4a51] text-white border-[#2a4a51] hover:bg-[#2a4a51]", // brand-dark
    outline: "bg-[#2a4a51]/80 text-white border-[#2a4a51] hover:bg-[#2a4a51]",
  },
]

const CATEGORY_HEX = ["#56939f", "#78ad7d", "#c14c66", "#dc6f45", "#2a4a51"]

const BOULE_STYLE =
  "rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 aspect-square"

export function PartenairesClient({ partenaires, categories }: PartenairesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const isMounted = useIsMounted()

  // Filter partenaires based on selected category
  const filteredPartenaires = selectedCategory
    ? partenaires.filter((p) => {
        // Check standard WP term embedding
        const terms = p._embedded?.["wp:term"]?.flat() || []
        return terms.some(
          (term) => term.id === selectedCategory && term.taxonomy === "type-de-partenaire"
        )
      })
    : partenaires

  // Split for OrbitingCircles - Create 5 layers for "Galaxy" effect to maximize spacing
  // Distribute partners evenly across 5 rings
  const total = filteredPartenaires.length
  const chunkSize = Math.ceil(total / 5)

  const layer1 = filteredPartenaires.slice(0, chunkSize)
  const layer2 = filteredPartenaires.slice(chunkSize, chunkSize * 2)
  const layer3 = filteredPartenaires.slice(chunkSize * 2, chunkSize * 3)
  const layer4 = filteredPartenaires.slice(chunkSize * 3, chunkSize * 4)
  const layer5 = filteredPartenaires.slice(chunkSize * 4)

  return (
    <div className="flex flex-col gap-8">
      {/* Taxonomy Filter Badges */}
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-sm py-2 px-4 transition-all rounded-lg",
              selectedCategory === null
                ? "bg-[#e75754] text-white border-[#e75754] hover:bg-[#e75754]"
                : "bg-[#e75754]/80 text-white border-[#e75754] hover:bg-[#e75754]"
            )}
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Badge>
          {categories.map((category, index) => {
            const colorTheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
            const isSelected = selectedCategory === category.id

            return (
              <Badge
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-sm py-2 px-4 transition-all rounded-lg",
                  isSelected ? colorTheme.selected : colorTheme.outline
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Galaxy Orbiting Circles — full bleed */}
      <div className="relative mb-8 flex h-[700px] w-screen left-1/2 -ml-[50vw] flex-col items-center justify-center overflow-hidden bg-background/50 pb-32 [perspective:1000px]">
        {/* Layer 1 - Inner - Tilted Left */}
        <div
          className="absolute flex size-full items-center justify-center [transform-style:preserve-3d]"
          style={{ transform: "rotateZ(30deg) rotateX(60deg)" }}
        >
          <OrbitingCircles
            className="border-none bg-transparent [transform-style:preserve-3d]"
            duration={35}
            delay={0}
            radius={120}
            iconSize={50}
            path={true}
          >
            {layer1.map((partenaire) => (
              <div
                key={`l1-${partenaire.id}`}
                style={{ transform: "rotateX(-60deg) rotateZ(-30deg)" }}
                className={cn(
                  "flex size-14 items-center justify-center p-2 transition-transform hover:scale-110",
                  BOULE_STYLE
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={partenaire.acf.logo.alt || partenaire.title.rendered}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    quality={70}
                  />
                ) : (
                  <span className="text-[10px] text-center font-bold text-gray-500 overflow-hidden text-ellipsis px-1">
                    {partenaire.title.rendered.substring(0, 3)}
                  </span>
                )}
              </div>
            ))}
          </OrbitingCircles>
        </div>

        {/* Layer 2 - Mid Inner - Tilted Right */}
        <div
          className="absolute flex size-full items-center justify-center [transform-style:preserve-3d]"
          style={{ transform: "rotateZ(-30deg) rotateX(60deg)" }}
        >
          <OrbitingCircles
            className="border-none bg-transparent [transform-style:preserve-3d]"
            radius={220}
            duration={45}
            delay={5}
            reverse
            iconSize={55}
            path={true}
          >
            {layer2.map((partenaire) => (
              <div
                key={`l2-${partenaire.id}`}
                style={{ transform: "rotateX(-60deg) rotateZ(30deg)" }}
                className={cn(
                  "flex size-16 items-center justify-center p-2 transition-transform hover:scale-110",
                  BOULE_STYLE
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={
                      partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered
                    }
                    width={45}
                    height={45}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    quality={70}
                  />
                ) : (
                  <span className="text-[10px] text-center font-bold text-gray-500 overflow-hidden text-ellipsis px-1">
                    {partenaire.title.rendered.substring(0, 3)}
                  </span>
                )}
              </div>
            ))}
          </OrbitingCircles>
        </div>

        {/* Layer 3 - Middle - Flat */}
        <div
          className="absolute flex size-full items-center justify-center [transform-style:preserve-3d]"
          style={{ transform: "rotateX(60deg)" }}
        >
          <OrbitingCircles
            className="border-none bg-transparent [transform-style:preserve-3d]"
            radius={320}
            duration={55}
            delay={10}
            iconSize={60}
            path={true}
          >
            {layer3.map((partenaire) => (
              <div
                key={`l3-${partenaire.id}`}
                style={{ transform: "rotateX(-60deg)" }}
                className={cn(
                  "flex size-20 items-center justify-center p-3 transition-transform hover:scale-110",
                  BOULE_STYLE
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={
                      partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered
                    }
                    width={55}
                    height={55}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    quality={70}
                  />
                ) : (
                  <span className="text-xs text-center font-bold text-gray-500 overflow-hidden text-ellipsis px-1">
                    {partenaire.title.rendered.substring(0, 3)}
                  </span>
                )}
              </div>
            ))}
          </OrbitingCircles>
        </div>

        {/* Layer 4 - Mid Outer - Tilted Slight Left */}
        <div
          className="absolute flex size-full items-center justify-center [transform-style:preserve-3d]"
          style={{ transform: "rotateZ(15deg) rotateX(60deg)" }}
        >
          <OrbitingCircles
            className="border-none bg-transparent [transform-style:preserve-3d]"
            radius={420}
            duration={65}
            delay={15}
            reverse
            iconSize={70}
            path={true}
          >
            {layer4.map((partenaire) => (
              <div
                key={`l4-${partenaire.id}`}
                style={{ transform: "rotateX(-60deg) rotateZ(-15deg)" }}
                className={cn(
                  "flex size-22 items-center justify-center p-3 transition-transform hover:scale-110",
                  BOULE_STYLE
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={
                      partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered
                    }
                    width={60}
                    height={60}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    quality={70}
                  />
                ) : (
                  <span className="text-xs text-center font-bold text-gray-500 overflow-hidden text-ellipsis px-1">
                    {partenaire.title.rendered.substring(0, 3)}
                  </span>
                )}
              </div>
            ))}
          </OrbitingCircles>
        </div>

        {/* Layer 5 - Outer - Tilted Slight Right */}
        <div
          className="absolute flex size-full items-center justify-center [transform-style:preserve-3d]"
          style={{ transform: "rotateZ(-15deg) rotateX(60deg)" }}
        >
          <OrbitingCircles
            className="border-none bg-transparent [transform-style:preserve-3d]"
            radius={520}
            duration={75}
            delay={20}
            iconSize={80}
            path={true}
          >
            {layer5.map((partenaire) => (
              <div
                key={`l5-${partenaire.id}`}
                style={{ transform: "rotateX(-60deg) rotateZ(15deg)" }}
                className={cn(
                  "flex size-24 items-center justify-center p-4 transition-transform hover:scale-110",
                  BOULE_STYLE
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={
                      partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered
                    }
                    width={70}
                    height={70}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    quality={70}
                  />
                ) : (
                  <span className="text-xs text-center font-bold text-gray-500 overflow-hidden text-ellipsis px-1">
                    {partenaire.title.rendered.substring(0, 3)}
                  </span>
                )}
              </div>
            ))}
          </OrbitingCircles>
        </div>
      </div>

      <div className="container mx-auto md:px-4">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredPartenaires.map((partenaire) => {
            const category = partenaire._embedded?.["wp:term"]?.[0]?.[0]
            const catIndex = category ? categories.findIndex((c) => c.id === category.id) : -1
            const bgColor = catIndex >= 0 ? CATEGORY_HEX[catIndex % CATEGORY_HEX.length] : "#e75754"
            const logo =
              partenaire._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
              partenaire.acf?.logo?.url
            const name = partenaire.acf?.nom || partenaire.title.rendered
            const url = partenaire.acf?.lien?.url ? sanitizeUrl(partenaire.acf.lien.url) : undefined

            const card = (
              <MinimalCard
                key={partenaire.id}
                className="flex flex-col items-center p-4 shadow-sm hover:shadow-md transition-shadow break-inside-avoid"
                style={{ backgroundColor: bgColor }}
              >
                {logo && (
                  <div className="flex items-center justify-center p-2">
                    <Image
                      src={logo}
                      alt={partenaire.acf?.logo?.alt || name}
                      width={120}
                      height={120}
                      className="w-auto object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                )}
                <h3 className="text-sm font-semibold text-white text-center leading-tight mt-2">
                  {name}
                </h3>
                {category?.name && (
                  <span className="text-xs text-white/70 mt-1">{category.name}</span>
                )}
              </MinimalCard>
            )

            return url ? (
              <a
                key={partenaire.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-inside-avoid block"
              >
                {card}
              </a>
            ) : (
              card
            )
          })}
        </div>
      </div>
    </div>
  )
}
