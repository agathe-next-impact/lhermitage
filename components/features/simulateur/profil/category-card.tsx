"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { SejourCategory, SimSejourTemplate } from "@/lib/simulateur/types"
import { SEJOUR_CATEGORIES } from "@/lib/simulateur/types"

const CATEGORY_COLORS: Record<SejourCategory, string> = {
  "cohesion-team-building": "#56939F",
  "seminaire-strategique": "#2A4A51",
  "incentive-recompense": "#E75754",
  "deconnexion-bien-etre": "#78AD7D",
  "onboarding-integration": "#DC6F45",
}

const DEFAULT_BG = "#2A4A51"

interface CategoryCardProps {
  template: SimSejourTemplate
  isSelected: boolean
  onSelect: (template: SimSejourTemplate) => void
}

export function CategoryCard({ template, isSelected, onSelect }: CategoryCardProps) {
  const categoryInfo = template.category ? SEJOUR_CATEGORIES[template.category] : null
  const bgColor = template.category
    ? (CATEGORY_COLORS[template.category] ?? DEFAULT_BG)
    : DEFAULT_BG
  const imageUrl = template.acf.image_hero?.url ?? template.featuredImage?.url

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(template)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative h-[220px] flex flex-col items-start justify-end p-5 rounded-2xl text-left overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl",
        isSelected && "ring-4 ring-brand-coral scale-[1.02]"
      )}
      style={imageUrl ? undefined : { backgroundColor: bgColor }}
    >
      {/* Background image */}
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={template.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </>
      )}

      {/* Large decorative emoji (fallback when no image) */}
      {!imageUrl && categoryInfo?.emoji && (
        <span className="absolute top-4 right-4 text-5xl opacity-30 select-none pointer-events-none">
          {categoryInfo.emoji}
        </span>
      )}

      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-heading uppercase font-extrabold text-white text-lg leading-tight">
          {template.title}
        </h3>
        <p className="text-white/80 text-sm mt-1 leading-relaxed line-clamp-2">
          {template.acf.description_promesse ?? categoryInfo?.description}
        </p>
        {template.acf.duree_jours && (
          <span className="inline-block mt-2 text-xs font-semibold text-white/60 bg-white/15 rounded-full px-2.5 py-0.5">
            {template.acf.duree_jours} jour{template.acf.duree_jours > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Selected checkmark badge */}
      {isSelected && (
        <motion.div
          layoutId="category-selected"
          className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg"
          transition={{ type: "spring", duration: 0.3 }}
        >
          <span className="text-brand-coral text-sm font-bold">✓</span>
        </motion.div>
      )}
    </motion.button>
  )
}
