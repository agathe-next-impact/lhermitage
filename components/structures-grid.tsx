"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { WPPost, WPImage, StructureACF } from "@/lib/wordpress/types"
import { getCategoryColor } from "@/lib/wordpress/category-colors"
import { truncateText } from "@/lib/utils"
import { sanitizeUrl } from "@/lib/wordpress/sanitize"
import { MinimalCard } from "@/components/ui/minimal-card"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import Image from "next/image"

interface SectionData {
  titre_de_section?: string
  image_de_section?: WPImage
}

interface StructuresGridProps {
  structures: WPPost<StructureACF>[]
  sectionInternes?: SectionData
  sectionHebergees?: SectionData
}

const StructureCard: React.FC<{
  structure: WPPost<StructureACF>
  categoryColor: string
}> = ({ structure, categoryColor }) => {
  const truncatedDescription = structure.acf?.descriptif
    ? truncateText(structure.acf.descriptif, 120)
    : ""

  return (
    <MinimalCard
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md transition-shadow relative"
      style={{ backgroundColor: categoryColor }}
    >
      <div className="px-2 pb-6">
        <h3 className="text-xl font-bold mb-3 text-white">
          {structure.acf?.nom || structure.title.rendered}
        </h3>
        <p className="text-white/80 text-sm mb-4 flex-1 line-clamp-4">{truncatedDescription}</p>

        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 shadow-sm text-xs h-8 px-4"
          >
            <Link href={`/structure/${structure.slug}`}>Voir</Link>
          </Button>

          {structure.acf?.lien?.url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full transition-colors hover:bg-white/10 bg-transparent border-white/40 text-white text-xs h-8 px-4"
            >
              <a
                href={sanitizeUrl(structure.acf.lien.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {structure.acf.lien.title || "Site web"}
              </a>
            </Button>
          )}
        </div>
      </div>
      <div>
        <Image
          src={
            structure._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/default-structure-logo.png"
          }
          alt={structure._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || structure.title.rendered}
          width={600}
          height={400}
          quality={100}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="rounded-xl object-cover w-full h-48"
        />
      </div>
    </MinimalCard>
  )
}

function FillerCard({ count, color, image }: { count: number; color: string; image?: string }) {
  const remainder = count % 3
  if (remainder === 0) return null
  const span = 3 - remainder
  return (
    <div
      className={`hidden lg:flex items-end justify-end rounded-[15px] p-6 overflow-hidden ${span === 2 ? "lg:col-span-2" : ""}`}
      style={{ backgroundColor: color }}
    >
      <Image
        src={image || "/logo-hermitage-new.png"}
        alt=""
        width={340}
        height={120}
        className="object-contain opacity-30 brightness-0 invert"
      />
    </div>
  )
}

export function StructuresGrid({
  structures,
  sectionInternes,
  sectionHebergees,
}: StructuresGridProps) {
  const internalStructures = structures.filter((s) => s.acf?.type_de_structure == "interne")
  const hostedStructures = structures.filter((s) => s.acf?.type_de_structure == "hebergee")

  return (
    <div className="space-y-8">
      {/* Internal Structures Section */}
      {internalStructures.length > 0 && (
        <BentoHeaderContent
          title={sectionInternes?.titre_de_section || "Structures internes"}
          color={BRAND_COLORS.green}
          columnImage={sectionInternes?.image_de_section?.url}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 pl-2">
            {internalStructures.map((structure) => {
              const categorySlug = structure._embedded?.["wp:term"]?.[0]?.[0]?.slug
              const categoryColor = categorySlug ? getCategoryColor(categorySlug) : "#e75754"

              return (
                <StructureCard
                  key={structure.id}
                  structure={structure}
                  categoryColor={categoryColor}
                />
              )
            })}
            <FillerCard count={internalStructures.length} color={BRAND_COLORS.coral} />
          </div>
        </BentoHeaderContent>
      )}

      {/* Hosted Structures Section */}
      {hostedStructures.length > 0 && (
        <BentoHeaderContent
          title={sectionHebergees?.titre_de_section || "Structures hébergées"}
          color={BRAND_COLORS.green}
          columnImage={sectionHebergees?.image_de_section?.url}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 pl-2">
            {hostedStructures.map((structure) => {
              const categorySlug = structure._embedded?.["wp:term"]?.[0]?.[0]?.slug
              const categoryColor = categorySlug ? getCategoryColor(categorySlug) : "#e75754"

              return (
                <StructureCard
                  key={structure.id}
                  structure={structure}
                  categoryColor={BRAND_COLORS.teal}
                />
              )
            })}
            <FillerCard count={hostedStructures.length} color={BRAND_COLORS.teal} />
          </div>
        </BentoHeaderContent>
      )}
    </div>
  )
}
