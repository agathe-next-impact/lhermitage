"use client"

import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { EspaceToggleCard } from "./espace-toggle-card"

export function EspaceList() {
  const data = useSimulateurData()
  const selectedEspaces = useSimulateurStore((s) => s.selectedEspaces)
  const toggleEspace = useSimulateurStore((s) => s.toggleEspace)
  const setEspacePrivatise = useSimulateurStore((s) => s.setEspacePrivatise)

  const isSelected = (slug: string) =>
    selectedEspaces.some((e) => e.espace_slug === slug)

  const isPrivatise = (slug: string) =>
    selectedEspaces.find((e) => e.espace_slug === slug)?.privatise ?? false

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="font-heading uppercase font-extrabold text-2xl text-brand-dark tracking-wide mb-2">
          Espaces de travail
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez les espaces dont vous aurez besoin pour votre séjour.
          Les espaces privatisables peuvent être réservés en exclusivité.
        </p>
      </div>

      {/* Espace cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {data.espaces.map((espace) => (
          <EspaceToggleCard
            key={espace.slug}
            espace={espace}
            isSelected={isSelected(espace.slug)}
            privatise={isPrivatise(espace.slug)}
            onToggle={() => toggleEspace(espace.slug)}
            onPrivatiseChange={(p) => setEspacePrivatise(espace.slug, p)}
          />
        ))}
      </motion.div>

      {data.espaces.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun espace de travail disponible pour le moment.
        </div>
      )}
    </div>
  )
}
