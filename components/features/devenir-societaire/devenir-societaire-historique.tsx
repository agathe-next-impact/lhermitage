"use client"

import { motion } from "framer-motion"
import { Sprout, Building2, Users, Rocket, Flag, Landmark, Heart, Star } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const STEP_ICONS: LucideIcon[] = [Sprout, Building2, Users, Rocket, Flag, Landmark, Heart, Star]

interface HistoriqueProps {
  sectionColor: string
  titre?: string
  descriptif?: string
  etapes?: Array<{
    annee: string
    descriptif: string
  }>
}

export function DevenirSocietaireHistorique({
  sectionColor,
  titre,
  etapes,
}: HistoriqueProps) {
  if (!etapes || etapes.length === 0) return null

  return (
    <section className="space-y-8">
      {titre && (
        <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
          {titre}
        </h3>
      )}
      <div className="relative pl-8 md:pl-0">
        {/* Vertical line */}
        <div
          className="absolute left-[15px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[3px] rounded-full"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${sectionColor} 10%, ${sectionColor} 85%, transparent 100%)`,
          }}
        />

        <div className="space-y-8 md:space-y-12">
          {etapes.map((etape, idx) => {
            const Icon = STEP_ICONS[idx % STEP_ICONS.length]
            const isEven = idx % 2 === 0
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" as const }}
                className={`relative flex flex-col md:flex-row md:items-start ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot on the line */}
                <div
                  className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-[32px] h-[32px] rounded-full flex items-center justify-center z-10 border-4 border-background"
                  style={{ backgroundColor: sectionColor }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>

                {/* Content card */}
                <div
                  className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                    isEven ? "md:pr-8 md:text-right" : "md:pl-8"
                  }`}
                >
                  <span
                    className="inline-block text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white mb-2"
                    style={{ backgroundColor: sectionColor }}
                  >
                    {etape.annee}
                  </span>
                  <p className="text-stone-700 leading-relaxed">{etape.descriptif}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
