"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TypeCreneau } from "@/lib/simulateur/types"
import { UnifiedSelector } from "./unified-selector"

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

const KIND_COLORS: Record<string, { bg: string; text: string; remove: string }> = {
  activite: { bg: "bg-[#E75754]/10", text: "text-[#E75754]", remove: "hover:bg-[#E75754]/20" },
  espace: { bg: "bg-[#56939F]/10", text: "text-[#56939F]", remove: "hover:bg-[#56939F]/20" },
  service: { bg: "bg-[#2A4A51]/10", text: "text-[#2A4A51]", remove: "hover:bg-[#2A4A51]/20" },
}

export function SlotCard({ dayIndex, slotIndex }: SlotCardProps) {
  const days = useSimulateurStore((s) => s.days)
  const groupSize = useSimulateurStore((s) => s.profile.groupSize)
  const toggleSlotItem = useSimulateurStore((s) => s.toggleSlotItem)
  const clearSlot = useSimulateurStore((s) => s.clearSlot)
  const data = useSimulateurData()

  const [selectorOpen, setSelectorOpen] = useState(false)

  const slot = days[dayIndex]?.slots[slotIndex]

  const handleOpenSelector = useCallback(() => {
    setSelectorOpen(true)
  }, [])

  const handleCloseSelector = useCallback(() => {
    setSelectorOpen(false)
  }, [])

  const handleClear = useCallback(() => {
    clearSlot(dayIndex, slotIndex)
  }, [clearSlot, dayIndex, slotIndex])

  const handleRemoveItem = useCallback(
    (kind: "activite" | "espace" | "service", slug: string) => {
      toggleSlotItem(dayIndex, slotIndex, kind, slug)
    },
    [toggleSlotItem, dayIndex, slotIndex]
  )

  // Resolve all selected items (with capacity alerts)
  const selectedItems = useMemo(() => {
    if (!slot) return []
    const items: Array<{
      kind: "activite" | "espace" | "service"
      slug: string
      label: string
      capacityExceeded?: boolean
    }> = []
    for (const slug of slot.activite_slugs ?? []) {
      const act = data.activites.find((a) => a.slug === slug)
      if (act)
        items.push({
          kind: "activite",
          slug,
          label: act.title || act.acf.nom,
          capacityExceeded: act.acf.capacite_max != null && act.acf.capacite_max < groupSize,
        })
    }
    for (const slug of slot.espace_slugs ?? []) {
      const esp = data.espaces.find((e) => e.slug === slug)
      if (esp)
        items.push({
          kind: "espace",
          slug,
          label: esp.title || esp.acf.nom,
          capacityExceeded: esp.acf.capacite_max != null && esp.acf.capacite_max < groupSize,
        })
    }
    for (const slug of slot.service_slugs ?? []) {
      const srv = data.services.find((s) => s.slug === slug)
      if (srv) items.push({ kind: "service", slug, label: srv.title || srv.acf.nom })
    }
    return items
  }, [slot, data.activites, data.espaces, data.services, groupSize])

  // Lock body scroll when selector is open
  useEffect(() => {
    if (!selectorOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseSelector()
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", handleKey)
    }
  }, [selectorOpen, handleCloseSelector])

  if (!slot) return null

  const typeConfig = TYPE_CONFIG[slot.type_creneau]
  const hasAssignment = selectedItems.length > 0
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

              {/* Selected items as chips */}
              {hasAssignment ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedItems.map((item) => {
                    const colors = KIND_COLORS[item.kind]
                    return (
                      <span
                        key={`${item.kind}-${item.slug}`}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          item.capacityExceeded
                            ? "bg-amber-100 text-amber-800"
                            : cn(colors.bg, colors.text)
                        )}
                        title={
                          item.capacityExceeded
                            ? "Capacité insuffisante pour votre groupe"
                            : undefined
                        }
                      >
                        {item.capacityExceeded && <span className="text-[10px]">⚠</span>}
                        {item.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveItem(item.kind, item.slug)
                          }}
                          className={cn(
                            "ml-0.5 rounded-full w-4 h-4 flex items-center justify-center transition-colors",
                            colors.remove
                          )}
                          title="Retirer"
                        >
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 2L2 6M2 2L6 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </span>
                    )
                  })}
                  <button
                    type="button"
                    onClick={handleOpenSelector}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    + Ajouter
                  </button>
                </div>
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
                title="Tout retirer"
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

      {/* Selector modal — portaled to body to avoid Framer layout jank */}
      {typeof document !== "undefined" &&
        createPortal(
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={handleCloseSelector}
                  aria-label="Fermer"
                />
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
                  className="relative z-10 w-full max-w-2xl bg-background rounded-xl border shadow-xl flex flex-col overflow-hidden"
                  style={{ height: "min(80vh, 700px)" }}
                >
                  <UnifiedSelector
                    dayIndex={dayIndex}
                    slotIndex={slotIndex}
                    onClose={handleCloseSelector}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
