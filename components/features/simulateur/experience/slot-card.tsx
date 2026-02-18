"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TypeCreneau } from "@/lib/simulateur/types"
import { ActivitySelector } from "./activity-selector"
import { EspaceSelector } from "./espace-selector"

interface SlotCardProps {
  dayIndex: number
  slotIndex: number
}

const TYPE_CONFIG: Record<TypeCreneau, { label: string; color: string; icon: string }> = {
  activite: { label: "Activité", color: "bg-[#E75754] text-white border-transparent", icon: "⚡" },
  repas: { label: "Repas", color: "bg-[#78AD7D] text-white border-transparent", icon: "🍽" },
  travail: { label: "Travail", color: "bg-[#56939F] text-white border-transparent", icon: "💼" },
  libre: { label: "Temps libre", color: "bg-gray-200 text-gray-600 border-transparent", icon: "☀" },
  soiree: { label: "Soirée", color: "bg-[#DC6F45] text-white border-transparent", icon: "🌙" },
}

export function SlotCard({ dayIndex, slotIndex }: SlotCardProps) {
  const days = useSimulateurStore((s) => s.days)
  const clearSlot = useSimulateurStore((s) => s.clearSlot)
  const data = useSimulateurData()

  const [selectorOpen, setSelectorOpen] = useState<"activite" | "espace" | null>(null)

  const slot = days[dayIndex]?.slots[slotIndex]

  const handleOpenSelector = useCallback(() => {
    const type = days[dayIndex]?.slots[slotIndex]?.type_creneau
    if (type === "travail") {
      setSelectorOpen("espace")
    } else {
      setSelectorOpen("activite")
    }
  }, [days, dayIndex, slotIndex])

  const handleCloseSelector = useCallback(() => {
    setSelectorOpen(null)
  }, [])

  const handleClear = useCallback(() => {
    clearSlot(dayIndex, slotIndex)
  }, [clearSlot, dayIndex, slotIndex])

  if (!slot) return null

  const typeConfig = TYPE_CONFIG[slot.type_creneau]

  // Resolve assigned names from data context
  const activity = slot.activite_slug
    ? data.activites.find((a) => a.slug === slot.activite_slug)
    : null
  const espace = slot.espace_slug ? data.espaces.find((e) => e.slug === slot.espace_slug) : null
  const service = slot.service_slug
    ? data.services.find((s) => s.slug === slot.service_slug)
    : null

  const hasAssignment = !!activity || !!espace || !!service
  const assignedLabel =
    activity?.title ??
    activity?.acf.nom ??
    espace?.title ??
    espace?.acf.nom ??
    service?.title ??
    service?.acf.nom ??
    null

  // Créneau label (set by initDays from CRENEAU_LABELS)
  const creneauLabel = slot.label_personnalise

  return (
    <>
      <div
        className={cn(
          "rounded-xl border-2 p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 group",
          hasAssignment
            ? "bg-background border-border"
            : "bg-muted/30 border-dashed border-border/60"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Time (mobile only) */}
            <span className="md:hidden text-xs font-mono text-muted-foreground pt-0.5 flex-shrink-0">
              {slot.heure_debut}
            </span>

            <div className="flex-1 min-w-0">
              {/* Créneau label + type badge */}
              <div className="flex items-center gap-2 mb-1.5">
                {creneauLabel && (
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-dark">
                    {creneauLabel}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] rounded-full px-2 py-0.5 font-semibold",
                    typeConfig.color
                  )}
                >
                  {typeConfig.icon} {typeConfig.label}
                </Badge>
              </div>

              {/* Content */}
              {assignedLabel ? (
                <button
                  type="button"
                  onClick={handleOpenSelector}
                  className="block text-sm font-heading font-bold text-left hover:text-brand-coral transition-colors truncate w-full"
                >
                  {assignedLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenSelector}
                  className="block text-sm text-muted-foreground italic hover:text-foreground transition-colors"
                >
                  Choisir...
                </button>
              )}
            </div>
          </div>

          {/* Clear action */}
          {hasAssignment && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground"
                title="Retirer la sélection"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Selector modal overlay */}
      <AnimatePresence>
        {selectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleCloseSelector}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCloseSelector()
              }}
              role="button"
              tabIndex={-1}
              aria-label="Fermer"
            />
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-background rounded-xl border shadow-xl overflow-hidden"
            >
              <div className="p-4 md:p-6 overflow-y-auto max-h-[80vh]">
                {selectorOpen === "activite" ? (
                  <ActivitySelector
                    dayIndex={dayIndex}
                    slotIndex={slotIndex}
                    onClose={handleCloseSelector}
                  />
                ) : (
                  <EspaceSelector
                    dayIndex={dayIndex}
                    slotIndex={slotIndex}
                    onClose={handleCloseSelector}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
