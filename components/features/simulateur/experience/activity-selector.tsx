"use client"

import { useState, useCallback, useMemo } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { CRENEAU_ORDER, CRENEAU_LABELS } from "@/lib/simulateur/constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NiveauPhysique, LieuType, SimActivite, SimService } from "@/lib/simulateur/types"

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

/** Map a slot's heure_debut (HH:MM) to the corresponding créneau period */
function getCreneauFromTime(heure: string): string {
  if (heure < "09:00") return "petit_dejeuner"
  if (heure < "12:00") return "matin"
  if (heure < "14:00") return "dejeuner"
  if (heure < "18:00") return "apres_midi"
  if (heure < "21:00") return "diner"
  return "soir"
}

function formatPrice(item: {
  acf: { mode_tarification?: string; prix_par_personne?: number; prix_forfaitaire?: number }
}): string {
  if (item.acf.mode_tarification === "forfaitaire" && item.acf.prix_forfaitaire) {
    return `${item.acf.prix_forfaitaire} € forfait`
  }
  if (item.acf.prix_par_personne) {
    return `${item.acf.prix_par_personne} € / pers.`
  }
  return "Inclus"
}

type SelectableItem =
  | { kind: "activite"; data: SimActivite }
  | { kind: "service"; data: SimService }

export function ActivitySelector({ dayIndex, slotIndex, onClose }: ActivitySelectorProps) {
  const updateSlot = useSimulateurStore((s) => s.updateSlot)
  const days = useSimulateurStore((s) => s.days)
  const data = useSimulateurData()

  // Determine current slot's time period for default créneau filter
  const currentSlot = days[dayIndex]?.slots[slotIndex]
  const currentCreneau = currentSlot ? getCreneauFromTime(currentSlot.heure_debut) : null

  // Gather all unique créneaux present in activities + services (in predefined order)
  const availableCreneaux = useMemo(() => {
    const set = new Set<string>()
    for (const act of data.activites) {
      act.acf.creneaux_disponibles?.forEach((c) => set.add(c))
    }
    for (const srv of data.services) {
      srv.acf.creneaux_disponibles?.forEach((c) => set.add(c))
    }
    return CRENEAU_ORDER.filter((c) => set.has(c))
  }, [data.activites, data.services])

  // Gather all unique activity types for sub-filtering
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

  // Default créneau filter to current slot's time period
  const [filterCreneau, setFilterCreneau] = useState<string | null>(currentCreneau)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Combined and filtered list of activities + services
  const filteredItems = useMemo(() => {
    const items: SelectableItem[] = []

    // Activities — exclude items without creneaux_disponibles
    for (const act of data.activites) {
      if (!act.acf.creneaux_disponibles?.length) continue
      if (filterCreneau && !act.acf.creneaux_disponibles.includes(filterCreneau)) continue
      if (filterType && !act.types?.some((t) => t.slug === filterType)) continue
      items.push({ kind: "activite", data: act })
    }

    // Services — exclude items without creneaux_disponibles
    for (const srv of data.services) {
      if (!srv.acf.creneaux_disponibles?.length) continue
      if (filterCreneau && !srv.acf.creneaux_disponibles.includes(filterCreneau)) continue
      // Activity type filter doesn't apply to services
      if (filterType) continue
      items.push({ kind: "service", data: srv })
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return items.filter(
        ({ data: d }) =>
          d.title.toLowerCase().includes(q) ||
          d.acf.nom?.toLowerCase().includes(q) ||
          d.acf.descriptif?.toLowerCase().includes(q)
      )
    }

    return items
  }, [data.activites, data.services, filterCreneau, filterType, search])

  const handleSelectActivity = useCallback(
    (slug: string) => {
      updateSlot(dayIndex, slotIndex, {
        activite_slugs: [slug],
        service_slugs: undefined,
        espace_slugs: undefined,
      })
      onClose()
    },
    [updateSlot, dayIndex, slotIndex, onClose]
  )

  const handleSelectService = useCallback(
    (slug: string) => {
      updateSlot(dayIndex, slotIndex, {
        service_slugs: [slug],
        activite_slugs: undefined,
        espace_slugs: undefined,
      })
      onClose()
    },
    [updateSlot, dayIndex, slotIndex, onClose]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-brand-dark">Choisir une expérience</h3>
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
        placeholder="Rechercher une activité ou un service..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-full border-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E75754]/30 focus:border-[#E75754]/50 transition-colors"
      />

      {/* Créneau filters */}
      {availableCreneaux.length > 0 && (
        <div>
          <p className="font-heading uppercase text-[10px] tracking-wider text-muted-foreground font-bold mb-1.5">
            Créneau
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterCreneau(null)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                filterCreneau === null
                  ? "bg-[#E75754] text-white shadow-lg"
                  : "bg-white border-2 border-border hover:border-[#E75754]/30"
              )}
            >
              Tous
            </button>
            {availableCreneaux.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCreneau(c)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                  filterCreneau === c
                    ? "bg-[#E75754] text-white shadow-lg"
                    : "bg-white border-2 border-border hover:border-[#E75754]/30"
                )}
              >
                {CRENEAU_LABELS[c] ?? c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity type filters */}
      {activityTypes.length > 0 && (
        <div>
          <p className="font-heading uppercase text-[10px] tracking-wider text-muted-foreground font-bold mb-1.5">
            Type d&apos;activité
          </p>
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
        </div>
      )}

      {/* Combined list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune expérience trouvée.
          </p>
        ) : (
          filteredItems.map((item) =>
            item.kind === "activite" ? (
              <ActivityCard
                key={`act-${item.data.slug}`}
                activite={item.data}
                onSelect={handleSelectActivity}
              />
            ) : (
              <ServiceCard
                key={`srv-${item.data.slug}`}
                service={item.data}
                onSelect={handleSelectService}
              />
            )
          )
        )}
      </div>
    </div>
  )
}

function ActivityCard({
  activite,
  onSelect,
}: {
  activite: SimActivite
  onSelect: (slug: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(activite.slug)}
      className="w-full text-left rounded-xl border-2 p-3 hover:border-[#E75754] hover:shadow-lg transition-all duration-300 cursor-pointer group/card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#E75754] transition-colors truncate">
              {activite.title}
            </p>
            <Badge
              variant="outline"
              className="text-[10px] rounded-full px-2 py-0 font-semibold bg-[#E75754]/10 text-[#E75754] border-transparent flex-shrink-0"
            >
              Activité
            </Badge>
          </div>
          {activite.acf.descriptif && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {activite.acf.descriptif}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {activite.acf.duree_minutes && (
              <span className="text-[10px] text-muted-foreground">
                {activite.acf.duree_minutes} min
              </span>
            )}
            {activite.acf.niveau_physique && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] rounded-full px-2 py-0.5 font-semibold",
                  NIVEAU_CONFIG[activite.acf.niveau_physique].color
                )}
              >
                {NIVEAU_CONFIG[activite.acf.niveau_physique].label}
              </Badge>
            )}
            {activite.acf.interieur_exterieur && (
              <Badge
                variant="outline"
                className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
              >
                {LIEU_CONFIG[activite.acf.interieur_exterieur].label}
              </Badge>
            )}
          </div>
        </div>
        <span className="text-xs font-bold text-[#E75754] flex-shrink-0 pt-0.5">
          {formatPrice(activite)}
        </span>
      </div>
    </button>
  )
}

function ServiceCard({
  service,
  onSelect,
}: {
  service: SimService
  onSelect: (slug: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.slug)}
      className="w-full text-left rounded-xl border-2 border-dashed p-3 hover:border-[#56939F] hover:shadow-lg transition-all duration-300 cursor-pointer group/card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#56939F] transition-colors truncate">
              {service.title}
            </p>
            <Badge
              variant="outline"
              className="text-[10px] rounded-full px-2 py-0 font-semibold bg-[#56939F]/10 text-[#56939F] border-transparent flex-shrink-0"
            >
              Service
            </Badge>
          </div>
          {(service.acf.description_courte || service.acf.descriptif) && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {service.acf.description_courte || service.acf.descriptif}
            </p>
          )}
          {service.acf.inclus_par_defaut && (
            <Badge
              variant="outline"
              className="text-[10px] rounded-full px-2 py-0.5 font-semibold bg-green-100 text-green-800 border-transparent mt-2"
            >
              Inclus
            </Badge>
          )}
        </div>
        <span className="text-xs font-bold text-[#56939F] flex-shrink-0 pt-0.5">
          {formatPrice(service)}
        </span>
      </div>
    </button>
  )
}
