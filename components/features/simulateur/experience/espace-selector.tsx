"use client"

import { useState, useCallback, useMemo } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Ambiance } from "@/lib/simulateur/types"

interface EspaceSelectorProps {
  dayIndex: number
  slotIndex: number
  onClose: () => void
}

const AMBIANCE_CONFIG: Record<Ambiance, { label: string; color: string }> = {
  professionnel: {
    label: "Professionnel",
    color: "bg-[#56939F]/15 text-[#56939F] border-transparent rounded-full",
  },
  decontracte: {
    label: "Décontracté",
    color: "bg-[#78AD7D]/15 text-[#78AD7D] border-transparent rounded-full",
  },
  intimiste: {
    label: "Intimiste",
    color: "bg-[#2A4A51]/10 text-[#2A4A51] border-transparent rounded-full",
  },
  festif: {
    label: "Festif",
    color: "bg-[#DC6F45]/15 text-[#DC6F45] border-transparent rounded-full",
  },
}

export function EspaceSelector({ dayIndex, slotIndex, onClose }: EspaceSelectorProps) {
  const updateSlot = useSimulateurStore((s) => s.updateSlot)
  const data = useSimulateurData()

  const [search, setSearch] = useState("")

  const filteredEspaces = useMemo(() => {
    let list = data.espaces
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.acf.nom?.toLowerCase().includes(q) ||
          e.acf.descriptif?.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.espaces, search])

  const handleSelect = useCallback(
    (slug: string) => {
      updateSlot(dayIndex, slotIndex, {
        espace_slug: slug,
        type_creneau: "travail",
        activite_slug: undefined,
      })
      onClose()
    },
    [updateSlot, dayIndex, slotIndex, onClose]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-brand-dark">Choisir un espace</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose} title="Fermer">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un espace..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-full border-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#56939F]/30 focus:border-[#56939F]/50 transition-colors"
      />

      {/* Espace list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {filteredEspaces.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun espace trouvé.</p>
        ) : (
          filteredEspaces.map((esp) => (
            <button
              key={esp.slug}
              type="button"
              onClick={() => handleSelect(esp.slug)}
              className="w-full text-left rounded-xl border-2 p-3 hover:border-[#56939F] hover:shadow-lg transition-all duration-300 cursor-pointer group/card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#56939F] transition-colors truncate">
                    {esp.title}
                  </p>
                  {esp.acf.descriptif && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {esp.acf.descriptif}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {esp.acf.capacite_max && (
                      <span className="text-[10px] text-muted-foreground">
                        {esp.acf.capacite_max} pers. max
                      </span>
                    )}
                    {esp.acf.superficie_m2 && (
                      <span className="text-[10px] text-muted-foreground">
                        {esp.acf.superficie_m2} m²
                      </span>
                    )}
                    {esp.acf.ambiance && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] rounded-full px-2 py-0.5 font-semibold",
                          AMBIANCE_CONFIG[esp.acf.ambiance].color
                        )}
                      >
                        {AMBIANCE_CONFIG[esp.acf.ambiance].label}
                      </Badge>
                    )}
                    {esp.acf.privatisable && (
                      <Badge
                        variant="outline"
                        className="text-[10px] rounded-full px-2 py-0.5 font-semibold bg-[#E75754]/10 text-[#E75754] border-transparent"
                      >
                        Privatisable
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pt-0.5">
                  {esp.acf.prix_privatisation_journee ? (
                    <span className="text-xs font-bold text-[#56939F]">
                      {esp.acf.prix_privatisation_journee} € / jour
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Inclus</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
