"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { SejourCategory } from "@/lib/simulateur/types"
import { SEJOUR_CATEGORIES } from "@/lib/simulateur/types"

const CATEGORY_COLORS: Record<SejourCategory, string> = {
  "cohesion-team-building": "#56939F",
  "seminaire-strategique": "#2A4A51",
  "incentive-recompense": "#E75754",
  "deconnexion-bien-etre": "#78AD7D",
  "onboarding-integration": "#DC6F45",
}

interface CategoryCardProps {
  category: SejourCategory
  isSelected: boolean
  onSelect: (category: SejourCategory) => void
}

export function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  const info = SEJOUR_CATEGORIES[category]
  const bgColor = CATEGORY_COLORS[category] ?? "#2A4A51"

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(category)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative h-[200px] flex flex-col items-start justify-end p-5 rounded-2xl text-left overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl",
        isSelected && "ring-4 ring-brand-coral scale-[1.02]"
      )}
      style={{ backgroundColor: bgColor }}
    >
      {/* Large decorative emoji */}
      <span className="absolute top-4 right-4 text-5xl opacity-30 select-none pointer-events-none">
        {info.emoji}
      </span>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-heading uppercase font-extrabold text-white text-lg leading-tight">
          {info.label}
        </h3>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">{info.description}</p>
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
