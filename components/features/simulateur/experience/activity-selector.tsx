"use client"

import { useState, useCallback, useMemo } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NiveauPhysique, LieuType } from "@/lib/simulateur/types"

interface ActivitySelectorProps {
  dayIndex: number
  slotIndex: number
  onClose: () => void
}

const NIVEAU_CONFIG: Record<NiveauPhysique, { label: string; color: string }> = {
  faible: { label: "Faible", color: "bg-green-100 text-green-800 border-transparent rounded-full" },
  modere: {
    label: "Modéré",
    color: "bg-yellow-100 text-yellow-800 border-transparent rounded-full",
  },
  intense: { label: "Intense", color: "bg-red-100 text-red-800 border-transparent rounded-full" },
}

const LIEU_CONFIG: Record<LieuType, { label: string }> = {
  interieur: { label: "Intérieur" },
  exterieur: { label: "Extérieur" },
  les_deux: { label: "Int. / Ext." },
}

function formatPrice(activite: {
  acf: { mode_tarification?: string; prix_par_personne?: number; prix_forfaitaire?: number }
}): string {
  if (activite.acf.mode_tarification === "forfaitaire" && activite.acf.prix_forfaitaire) {
    return `${activite.acf.prix_forfaitaire} € forfait`
  }
  if (activite.acf.prix_par_personne) {
    return `${activite.acf.prix_par_personne} € / pers.`
  }
  return "Inclus"
}

export function ActivitySelector({ dayIndex, slotIndex, onClose }: ActivitySelectorProps) {
  const updateSlot = useSimulateurStore((s) => s.updateSlot)
  const data = useSimulateurData()

  // Gather all unique activity types for filtering
  const activityTypes = useMemo(() => {
    const typesMap = new Map<string, string>()
    for (const act of data.activites) {
      if (act.types) {
        for (const t of act.types) {
          typesMap.set(t.slug, t.name)
        }
      }
    }
    return Array.from(typesMap.entries()).map(([slug, name]) => ({ slug, name }))
  }, [data.activites])

  const [filterType, setFilterType] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const filteredActivites = useMemo(() => {
    let list = data.activites
    if (filterType) {
      list = list.filter((a) => a.types?.some((t) => t.slug === filterType))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.acf.nom?.toLowerCase().includes(q) ||
          a.acf.descriptif?.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.activites, filterType, search])

  const handleSelect = useCallback(
    (slug: string) => {
      updateSlot(dayIndex, slotIndex, {
        activite_slug: slug,
        type_creneau: "activite",
        espace_slug: undefined,
      })
      onClose()
    },
    [updateSlot, dayIndex, slotIndex, onClose]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-brand-dark">Choisir une activité</h3>
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
        placeholder="Rechercher une activité..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-full border-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E75754]/30 focus:border-[#E75754]/50 transition-colors"
      />

      {/* Type filters */}
      {activityTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterType(null)}
            className={cn(
              "px-3 py-1 rounded-full font-heading uppercase text-xs font-bold tracking-wider transition-all duration-200",
              filterType === null
                ? "bg-[#2A4A51] text-white shadow-lg"
                : "bg-white border-2 border-border hover:border-[#2A4A51]/30"
            )}
          >
            Toutes
          </button>
          {activityTypes.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setFilterType(t.slug)}
              className={cn(
                "px-3 py-1 rounded-full font-heading uppercase text-xs font-bold tracking-wider transition-all duration-200",
                filterType === t.slug
                  ? "bg-[#2A4A51] text-white shadow-lg"
                  : "bg-white border-2 border-border hover:border-[#2A4A51]/30"
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Activity list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {filteredActivites.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune activité trouvée.</p>
        ) : (
          filteredActivites.map((act) => (
            <button
              key={act.slug}
              type="button"
              onClick={() => handleSelect(act.slug)}
              className="w-full text-left rounded-xl border-2 p-3 hover:border-[#E75754] hover:shadow-lg transition-all duration-300 cursor-pointer group/card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#E75754] transition-colors truncate">
                    {act.title}
                  </p>
                  {act.acf.descriptif && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {act.acf.descriptif}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {act.acf.duree_minutes && (
                      <span className="text-[10px] text-muted-foreground">
                        {act.acf.duree_minutes} min
                      </span>
                    )}
                    {act.acf.niveau_physique && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] rounded-full px-2 py-0.5 font-semibold",
                          NIVEAU_CONFIG[act.acf.niveau_physique].color
                        )}
                      >
                        {NIVEAU_CONFIG[act.acf.niveau_physique].label}
                      </Badge>
                    )}
                    {act.acf.interieur_exterieur && (
                      <Badge
                        variant="outline"
                        className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
                      >
                        {LIEU_CONFIG[act.acf.interieur_exterieur].label}
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-[#E75754] flex-shrink-0 pt-0.5">
                  {formatPrice(act)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
