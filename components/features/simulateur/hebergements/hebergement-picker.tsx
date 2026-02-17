"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { HebergementCard } from "./hebergement-card"
import { CapacityBar } from "./capacity-bar"

export function HebergementPicker() {
  const data = useSimulateurData()
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const setAccommodation = useSimulateurStore((s) => s.setAccommodation)
  const groupSize = useSimulateurStore((s) => s.profile.groupSize)

  const totalCapacity = useMemo(() => {
    return accommodations.reduce((sum, acc) => {
      const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
      if (!heb) return sum
      return sum + (heb.acf.capacite_personnes ?? 0) * acc.quantity
    }, 0)
  }, [accommodations, data.hebergements])

  const getQuantity = (slug: string): number => {
    return accommodations.find((a) => a.hebergement_slug === slug)?.quantity ?? 0
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="font-heading uppercase font-extrabold text-2xl text-brand-dark tracking-wide mb-2">
          Choisissez vos hébergements
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez le type et le nombre d&apos;hébergements pour loger l&apos;ensemble de vos
          participants.
        </p>
      </div>

      {/* Capacity bar */}
      <div className="rounded-xl border bg-card p-4">
        <CapacityBar current={totalCapacity} target={groupSize} />
      </div>

      {/* Grid of hébergements */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {data.hebergements.map((heb) => (
          <HebergementCard
            key={heb.slug}
            hebergement={heb}
            quantity={getQuantity(heb.slug)}
            onQuantityChange={(qty) => setAccommodation(heb.slug, qty)}
          />
        ))}
      </motion.div>

      {data.hebergements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun hébergement disponible pour le moment.
        </div>
      )}
    </div>
  )
}
