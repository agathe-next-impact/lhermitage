"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { WPPost, HebergementACF } from "@/lib/wordpress/types"
import { getCategoryColor } from "@/lib/wordpress/category-colors"
import { truncateText } from "@/lib/utils"
import { MinimalCard } from "@/components/ui/minimal-card"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface HebergementsGridProps {
  hebergements: WPPost<HebergementACF>[]
}

const HebergementCard: React.FC<{
  hebergement: WPPost<HebergementACF>
  categoryColor: string
}> = ({ hebergement, categoryColor }) => {
  const truncatedDescription = hebergement.acf?.descriptif
    ? truncateText(hebergement.acf.descriptif, 120)
    : ""

  const imageUrl =
    hebergement.acf?.photos?.[0]?.url ||
    hebergement._embedded?.["wp:featuredmedia"]?.[0]?.source_url

  const imageAlt =
    hebergement.acf?.photos?.[0]?.alt ||
    hebergement._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
    hebergement.title.rendered

  return (
    <MinimalCard
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md transition-shadow relative"
      style={{ backgroundColor: categoryColor }}
    >
      <div className="px-2 pb-6">
        <h3 className="text-xl font-bold mb-3 text-white">
          {hebergement.acf?.nom || hebergement.title.rendered}
        </h3>
        <p className="text-white/80 text-sm mb-4 flex-1 line-clamp-4">{truncatedDescription}</p>

        <Button
          asChild
          size="sm"
          className="rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 shadow-sm text-xs h-8 px-4"
        >
          <Link href={`/hebergement/${hebergement.slug}`}>Découvrir</Link>
        </Button>
      </div>
      {imageUrl && (
        <div>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={600}
            height={400}
            quality={100}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="rounded-xl object-cover w-full h-48"
          />
        </div>
      )}
    </MinimalCard>
  )
}

export function HebergementsGrid({ hebergements }: HebergementsGridProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {hebergements.map((hebergement) => {
        const categorySlug = hebergement._embedded?.["wp:term"]?.[0]?.[0]?.slug

        return (
          <HebergementCard
            key={hebergement.id}
            hebergement={hebergement}
            categoryColor={BRAND_COLORS.rose}
          />
        )
      })}
    </div>
  )
}
