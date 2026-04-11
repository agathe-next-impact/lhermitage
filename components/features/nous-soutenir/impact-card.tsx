"use client"

import { motion } from "framer-motion"

interface ImpactCardProps {
  montant?: number
  description?: string
  color: string
  index?: number
}

/**
 * Card showing a donation amount + the concrete impact it funds.
 * Used inside PillarSection (4 cards per pillar).
 */
export function ImpactCard({ montant, description, color, index = 0 }: ImpactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="rounded-xl p-5 md:p-6 bg-white shadow-md border border-black/5 flex flex-col gap-3"
    >
      {montant != null && (
        <div className="text-3xl md:text-4xl font-black tracking-tight" style={{ color }}>
          {montant}&nbsp;€
        </div>
      )}
      {description && (
        <p className="text-sm md:text-base text-brand-dark/80 leading-snug">{description}</p>
      )}
    </motion.div>
  )
}
