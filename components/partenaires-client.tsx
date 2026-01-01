"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import type { WPPost, PartenaireACF, WPTerm } from "@/lib/wordpress/types"
import { cn, stripHtml } from "@/lib/utils"
import { HeroCard } from "@/components/hero-card"

interface PartenairesClientProps {
  partenaires: WPPost<PartenaireACF>[]
  categories: WPTerm[]
}

const CATEGORY_COLORS = [
  {
    selected: "bg-[#56939f] text-white border-[#56939f] hover:bg-[#46838f]", // brand-teal
    outline: "text-[#56939f] border-[#56939f] hover:bg-[#56939f] hover:text-white",
  },
  {
    selected: "bg-[#78ad7d] text-white border-[#78ad7d] hover:bg-[#689d6d]", // brand-green
    outline: "text-[#78ad7d] border-[#78ad7d] hover:bg-[#78ad7d] hover:text-white",
  },
  {
    selected: "bg-[#c14c66] text-white border-[#c14c66] hover:bg-[#b13c56]", // brand-pink
    outline: "text-[#c14c66] border-[#c14c66] hover:bg-[#c14c66] hover:text-white",
  },
  {
    selected: "bg-[#dc6f45] text-white border-[#dc6f45] hover:bg-[#cc5f35]", // brand-orange
    outline: "text-[#dc6f45] border-[#dc6f45] hover:bg-[#dc6f45] hover:text-white",
  },
  {
    selected: "bg-[#2a4a51] text-white border-[#2a4a51] hover:bg-[#1a3a41]", // brand-dark
    outline: "text-[#2a4a51] border-[#2a4a51] hover:bg-[#2a4a51] hover:text-white",
  },
]

const BOULE_STYLE = "rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 aspect-square"

export function PartenairesClient({ partenaires, categories }: PartenairesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter partenaires based on selected category
  const filteredPartenaires = selectedCategory
    ? partenaires.filter((p) => {
        // Check standard WP term embedding
        const terms = p._embedded?.["wp:term"]?.flat() || []
        return terms.some((term) => term.id === selectedCategory && term.taxonomy === "type-de-partenaire")
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
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-sm py-2 px-4 transition-all rounded-full",
              selectedCategory === null
                ? "bg-[#e75754] hover:bg-[#d64643] text-white border-[#e75754]"
                : "text-[#e75754] border-[#e75754] hover:bg-[#e75754] hover:text-white bg-transparent",
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
                  "cursor-pointer text-sm py-2 px-4 transition-all rounded-full",
                  isSelected ? colorTheme.selected : colorTheme.outline,
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Galaxy Orbiting Circles */}
      <div className="relative mb-8 flex h-[700px] w-full flex-col items-center justify-center overflow-hidden border-y bg-background/50 pb-32 [perspective:1000px]">
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
                  BOULE_STYLE,
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
                  BOULE_STYLE,
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered}
                    width={45}
                    height={45}
                    className="h-full w-full object-contain"
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
                  BOULE_STYLE,
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered}
                    width={55}
                    height={55}
                    className="h-full w-full object-contain"
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
                  BOULE_STYLE,
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered}
                    width={60}
                    height={60}
                    className="h-full w-full object-contain"
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
                  BOULE_STYLE,
                )}
                title={partenaire.title.rendered}
              >
                {partenaire.acf?.logo ? (
                  <Image
                    src={partenaire.acf.logo.url || "/placeholder.svg"}
                    alt={partenaire.acf.logo.alt || partenaire.acf?.nom || partenaire.title.rendered}
                    width={70}
                    height={70}
                    className="h-full w-full object-contain"
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

      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartenaires.map((partenaire) => {
            const category = partenaire._embedded?.["wp:term"]?.[0]?.[0]

            return (
              <HeroCard
                key={partenaire.id}
                title={partenaire.acf?.nom || partenaire.title.rendered}
                description={partenaire.acf?.descriptif ? stripHtml(partenaire.acf.descriptif) : undefined}
                image={partenaire._embedded?.["wp:featuredmedia"]?.[0]?.source_url || partenaire.acf?.logo?.url}
                imageAlt={partenaire.acf?.logo?.alt || partenaire.title.rendered}
                imageFit="contain"
                link={partenaire.acf?.lien?.url}
                linkText={partenaire.acf?.lien ? "Visiter le site" : undefined}
                category={category?.name}
                categorySlug={category?.slug}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
