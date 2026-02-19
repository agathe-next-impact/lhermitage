"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, stripHtml } from "@/lib/utils"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"
import type {
  NiveauPhysique,
  LieuType,
  Ambiance,
  SimActivite,
  SimService,
  SimEspace,
} from "@/lib/simulateur/types"

interface UnifiedSelectorProps {
  dayIndex: number
  slotIndex: number
  onClose: () => void
}

type TabKind = "tous" | "activite" | "espace" | "service"
type ItemKind = "activite" | "espace" | "service"
type TaggedItem =
  | { kind: "activite"; item: SimActivite }
  | { kind: "espace"; item: SimEspace }
  | { kind: "service"; item: SimService }

const ITEMS_PER_PAGE = 6

const TABS: Array<{ kind: TabKind; label: string; color: string; activeColor: string }> = [
  {
    kind: "tous",
    label: "Tous",
    color: "hover:border-[#2A4A51]/30",
    activeColor: "bg-[#2A4A51] text-white shadow-lg",
  },
  {
    kind: "activite",
    label: "Activités",
    color: "hover:border-[#E75754]/30",
    activeColor: "bg-[#E75754] text-white shadow-lg",
  },
  {
    kind: "espace",
    label: "Espaces",
    color: "hover:border-[#56939F]/30",
    activeColor: "bg-[#56939F] text-white shadow-lg",
  },
  {
    kind: "service",
    label: "Services",
    color: "hover:border-[#2A4A51]/30",
    activeColor: "bg-[#2A4A51] text-white shadow-lg",
  },
]

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

/** Strip HTML tags and decode entities for plain-text preview of WYSIWYG fields */
function toPlainText(html: string): string {
  return decodeHtmlEntities(stripHtml(html))
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

export function UnifiedSelector({ dayIndex, slotIndex, onClose }: UnifiedSelectorProps) {
  const toggleSlotItem = useSimulateurStore((s) => s.toggleSlotItem)
  const days = useSimulateurStore((s) => s.days)
  const storeSelectedServices = useSimulateurStore((s) => s.selectedServices)
  const groupSize = useSimulateurStore((s) => s.profile.groupSize)
  const toggleService = useSimulateurStore((s) => s.toggleService)
  const setServiceOption = useSimulateurStore((s) => s.setServiceOption)
  const data = useSimulateurData()

  const currentSlot = days[dayIndex]?.slots[slotIndex]

  // Currently selected slugs for this slot
  const selectedActivites = currentSlot?.activite_slugs ?? []
  const selectedEspaces = currentSlot?.espace_slugs ?? []
  const selectedServices = currentSlot?.service_slugs ?? []
  const totalSelected = selectedActivites.length + selectedEspaces.length + selectedServices.length

  const [activeTab, setActiveTab] = useState<TabKind>("tous")
  const [search, setSearch] = useState("")
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterNiveau, setFilterNiveau] = useState<NiveauPhysique | null>(null)
  const [filterLieu, setFilterLieu] = useState<LieuType | null>(null)
  const [filterAmbiance, setFilterAmbiance] = useState<Ambiance | null>(null)

  // Activity type filters from CPT taxonomy
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

  // Filtered lists
  const filteredActivites = useMemo(() => {
    let list = data.activites.filter((a) => a.acf.creneaux_disponibles?.length)
    if (filterType) {
      list = list.filter((a) => a.types?.some((t) => t.slug === filterType))
    }
    if (filterNiveau) {
      list = list.filter((a) => a.acf.niveau_physique === filterNiveau)
    }
    if (filterLieu) {
      list = list.filter(
        (a) => a.acf.interieur_exterieur === filterLieu || a.acf.interieur_exterieur === "les_deux"
      )
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
  }, [data.activites, filterType, filterNiveau, filterLieu, search])

  const filteredEspaces = useMemo(() => {
    let list = data.espaces
    if (filterAmbiance) {
      list = list.filter((e) => e.acf.ambiance === filterAmbiance)
    }
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
  }, [data.espaces, filterAmbiance, search])

  const filteredServices = useMemo(() => {
    let list = data.services.filter((s) => s.acf.creneaux_disponibles?.length)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.acf.nom?.toLowerCase().includes(q) ||
          s.acf.descriptif?.toLowerCase().includes(q)
      )
    }
    return list
  }, [data.services, search])

  const handleToggle = useCallback(
    (kind: ItemKind, slug: string) => {
      toggleSlotItem(dayIndex, slotIndex, kind, slug)
    },
    [toggleSlotItem, dayIndex, slotIndex]
  )

  // Sync service toggle with selectedServices (for pricing + options)
  const handleServiceToggle = useCallback(
    (slug: string) => {
      const isCurrentlyInSlot = selectedServices.includes(slug)
      toggleSlotItem(dayIndex, slotIndex, "service", slug)

      const isInGlobal = storeSelectedServices.some((s) => s.service_slug === slug)

      if (!isCurrentlyInSlot && !isInGlobal) {
        // Being added to slot → also add to global selectedServices
        toggleService(slug)
      } else if (isCurrentlyInSlot && isInGlobal) {
        // Being removed from slot → remove from global if not in any other slot
        const stillUsedElsewhere = days.some((day, di) =>
          day.slots.some((slot, si) => {
            if (di === dayIndex && si === slotIndex) return false
            return slot.service_slugs?.includes(slug)
          })
        )
        if (!stillUsedElsewhere) {
          toggleService(slug)
        }
      }
    },
    [
      selectedServices,
      toggleSlotItem,
      dayIndex,
      slotIndex,
      storeSelectedServices,
      toggleService,
      days,
    ]
  )

  const handleOptionSelect = useCallback(
    (serviceSlug: string, optionIndex: number) => {
      setServiceOption(serviceSlug, optionIndex)
    },
    [setServiceOption]
  )

  const togglePreview = useCallback((key: string) => {
    setExpandedPreview((prev) => (prev === key ? null : key))
  }, [])

  // ── Pagination ──
  const [page, setPage] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Build a unified tagged list for the current tab, then paginate
  const allItems = useMemo((): TaggedItem[] => {
    const items: TaggedItem[] = []
    if (activeTab === "tous" || activeTab === "activite") {
      for (const item of filteredActivites) items.push({ kind: "activite", item })
    }
    if (activeTab === "tous" || activeTab === "espace") {
      for (const item of filteredEspaces) items.push({ kind: "espace", item })
    }
    if (activeTab === "tous" || activeTab === "service") {
      for (const item of filteredServices) items.push({ kind: "service", item })
    }
    return items
  }, [activeTab, filteredActivites, filteredEspaces, filteredServices])

  const pageCount = Math.ceil(allItems.length / ITEMS_PER_PAGE)
  const pageItems = allItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const goToPage = useCallback((p: number) => {
    setPage(p)
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const showTypeFilter =
    (activeTab === "tous" || activeTab === "activite") && activityTypes.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* ── Pinned header ── */}
      <div className="flex-shrink-0 p-4 md:p-6 pb-0 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-brand-dark">Composer ce créneau</h3>
            {totalSelected > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalSelected} élément{totalSelected > 1 ? "s" : ""} sélectionné
                {totalSelected > 1 ? "s" : ""}
              </p>
            )}
          </div>
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

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const count =
              tab.kind === "tous"
                ? totalSelected
                : tab.kind === "activite"
                  ? selectedActivites.length
                  : tab.kind === "espace"
                    ? selectedEspaces.length
                    : selectedServices.length
            return (
              <button
                key={tab.kind}
                type="button"
                onClick={() => {
                  setActiveTab(tab.kind)
                  setSearch("")
                  setPage(0)
                  if (tab.kind !== "activite" && tab.kind !== "tous") {
                    setFilterType(null)
                    setFilterNiveau(null)
                    setFilterLieu(null)
                  }
                  if (tab.kind !== "espace" && tab.kind !== "tous") setFilterAmbiance(null)
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                  activeTab === tab.kind
                    ? tab.activeColor
                    : `bg-white border-2 border-border ${tab.color}`
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                      activeTab === tab.kind ? "bg-white/30" : "bg-current/10"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={
            activeTab === "tous"
              ? "Rechercher..."
              : activeTab === "activite"
                ? "Rechercher une activité..."
                : activeTab === "espace"
                  ? "Rechercher un espace..."
                  : "Rechercher un service..."
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="w-full px-4 py-2 rounded-full border-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E75754]/30 focus:border-[#E75754]/50 transition-colors"
        />

        {/* Filters — context-dependent by active tab */}
        {showTypeFilter && (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setFilterType(null)
                setPage(0)
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                filterType === null
                  ? "bg-[#E75754] text-white shadow-lg"
                  : "bg-white border-2 border-border hover:border-[#E75754]/30"
              )}
            >
              Tous
            </button>
            {activityTypes.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => {
                  setFilterType(t.slug)
                  setPage(0)
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                  filterType === t.slug
                    ? "bg-[#E75754] text-white shadow-lg"
                    : "bg-white border-2 border-border hover:border-[#E75754]/30"
                )}
              >
                {decodeHtmlEntities(t.name)}
              </button>
            ))}
          </div>
        )}

        {/* Advanced filters for activities: niveau physique + lieu */}
        {(activeTab === "tous" || activeTab === "activite") && (
          <div className="flex gap-1.5 flex-wrap">
            {(
              [
                ["faible", "Faible"],
                ["modere", "Modéré"],
                ["intense", "Intense"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setFilterNiveau(filterNiveau === val ? null : val)
                  setPage(0)
                }}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200",
                  filterNiveau === val
                    ? NIVEAU_CONFIG[val].color
                    : "bg-white border border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
            <span className="w-px h-5 bg-border self-center mx-0.5" />
            {(
              [
                ["interieur", "Intérieur"],
                ["exterieur", "Extérieur"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setFilterLieu(filterLieu === val ? null : val)
                  setPage(0)
                }}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200",
                  filterLieu === val
                    ? "bg-[#2A4A51] text-white"
                    : "bg-white border border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Advanced filters for espaces: ambiance */}
        {activeTab === "espace" && (
          <div className="flex gap-1.5 flex-wrap">
            {(
              Object.entries(AMBIANCE_CONFIG) as Array<[Ambiance, { label: string; color: string }]>
            ).map(([val, cfg]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setFilterAmbiance(filterAmbiance === val ? null : val)
                  setPage(0)
                }}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all duration-200",
                  filterAmbiance === val
                    ? cfg.color
                    : "bg-white border border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable list ── */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-3 space-y-2">
        {pageItems.length > 0 ? (
          pageItems.map((tagged) => {
            if (tagged.kind === "activite") {
              return (
                <ActivityCard
                  key={`a-${tagged.item.slug}`}
                  activite={tagged.item}
                  isSelected={selectedActivites.includes(tagged.item.slug)}
                  onToggle={() => handleToggle("activite", tagged.item.slug)}
                  groupSize={groupSize}
                  isPreviewExpanded={expandedPreview === `a-${tagged.item.slug}`}
                  onTogglePreview={() => togglePreview(`a-${tagged.item.slug}`)}
                />
              )
            }
            if (tagged.kind === "espace") {
              return (
                <EspaceCard
                  key={`e-${tagged.item.slug}`}
                  espace={tagged.item}
                  isSelected={selectedEspaces.includes(tagged.item.slug)}
                  onToggle={() => handleToggle("espace", tagged.item.slug)}
                  groupSize={groupSize}
                  isPreviewExpanded={expandedPreview === `e-${tagged.item.slug}`}
                  onTogglePreview={() => togglePreview(`e-${tagged.item.slug}`)}
                />
              )
            }
            const svcSelected = selectedServices.includes(tagged.item.slug)
            const globalSel = storeSelectedServices.find((s) => s.service_slug === tagged.item.slug)
            return (
              <ServiceCard
                key={`s-${tagged.item.slug}`}
                service={tagged.item}
                isSelected={svcSelected}
                onToggle={() => handleServiceToggle(tagged.item.slug)}
                selectedOptionIndex={globalSel?.option_index}
                onOptionSelect={
                  svcSelected && tagged.item.acf.options?.length
                    ? (idx: number) => handleOptionSelect(tagged.item.slug, idx)
                    : undefined
                }
                isPreviewExpanded={expandedPreview === `s-${tagged.item.slug}`}
                onTogglePreview={() => togglePreview(`s-${tagged.item.slug}`)}
              />
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            {activeTab === "activite"
              ? "Aucune activité trouvée."
              : activeTab === "espace"
                ? "Aucun espace trouvé."
                : activeTab === "service"
                  ? "Aucun service trouvé."
                  : "Aucun élément trouvé."}
          </p>
        )}
      </div>

      {/* ── Pinned footer ── */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-t flex items-center justify-between gap-3">
        {/* Pagination */}
        {pageCount > 1 ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted"
              aria-label="Page précédente"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 2.5L4 6L7.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => goToPage(page + 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted"
              aria-label="Page suivante"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.5 2.5L8 6L4.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Validate */}
        <div
          className={cn(
            "transition-opacity duration-150",
            totalSelected > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button onClick={onClose} className="bg-[#2A4A51] hover:bg-[#2A4A51]/90">
            Valider ({totalSelected})
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Item Cards ──────────────────────────────────────────────

function CheckIndicator({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
        isSelected ? "bg-[#2A4A51] border-[#2A4A51]" : "border-border"
      )}
    >
      {isSelected && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 5L4 7L8 3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}

function ActivityCard({
  activite,
  isSelected,
  onToggle,
  groupSize,
  isPreviewExpanded,
  onTogglePreview,
}: {
  activite: SimActivite
  isSelected: boolean
  onToggle: () => void
  groupSize: number
  isPreviewExpanded: boolean
  onTogglePreview: () => void
}) {
  const capacityExceeded =
    activite.acf.capacite_max != null && activite.acf.capacite_max < groupSize
  const previewDescription =
    activite.acf.description_immersive ||
    (activite.acf.descriptif ? toPlainText(activite.acf.descriptif) : undefined)
  const hasPreviewContent = !!(
    previewDescription ||
    activite.acf.galerie?.length ||
    activite.acf.video_teaser_url
  )

  return (
    <div
      className={cn(
        "w-full text-left rounded-xl border-2 transition-all duration-300 group/card",
        isSelected
          ? "border-[#E75754] bg-[#E75754]/5 shadow-md"
          : "hover:border-[#E75754] hover:shadow-lg",
        capacityExceeded && !isSelected && "border-amber-400"
      )}
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-3 cursor-pointer">
        <div className="flex items-start gap-3">
          <CheckIndicator isSelected={isSelected} />
          {activite.featuredImage && (
            <Image
              src={activite.featuredImage.sizes?.thumbnail ?? activite.featuredImage.url}
              alt={activite.featuredImage.alt || activite.title}
              width={56}
              height={56}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#E75754] transition-colors truncate">
                {decodeHtmlEntities(activite.title)}
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
                {toPlainText(activite.acf.descriptif)}
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
              {capacityExceeded && (
                <Badge
                  variant="outline"
                  className="text-[10px] rounded-full px-2 py-0.5 font-semibold bg-amber-100 text-amber-800 border-transparent"
                >
                  ⚠ Max {activite.acf.capacite_max} pers.
                </Badge>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-[#E75754] flex-shrink-0 pt-0.5">
            {formatPrice(activite)}
          </span>
        </div>
      </button>

      {/* Capacity warning detail */}
      {capacityExceeded && (
        <div className="px-3 pb-2 ml-8">
          <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1">
            Capacité max. {activite.acf.capacite_max} pers. — votre groupe compte {groupSize}{" "}
            personnes
          </p>
        </div>
      )}

      {/* Preview toggle */}
      {hasPreviewContent && (
        <PreviewToggle isExpanded={isPreviewExpanded} onClick={onTogglePreview} />
      )}

      {/* Expandable preview */}
      {isPreviewExpanded && (
        <ItemPreview
          description={previewDescription}
          gallery={activite.acf.galerie}
          videoUrl={activite.acf.video_teaser_url}
        />
      )}
    </div>
  )
}

function EspaceCard({
  espace,
  isSelected,
  onToggle,
  groupSize,
  isPreviewExpanded,
  onTogglePreview,
}: {
  espace: SimEspace
  isSelected: boolean
  onToggle: () => void
  groupSize: number
  isPreviewExpanded: boolean
  onTogglePreview: () => void
}) {
  const capacityExceeded = espace.acf.capacite_max != null && espace.acf.capacite_max < groupSize
  const previewDescription =
    espace.acf.description_immersive ||
    (espace.acf.descriptif ? toPlainText(espace.acf.descriptif) : undefined)
  const hasPreviewContent = !!(
    previewDescription ||
    espace.acf.galerie?.length ||
    espace.acf.vue_360_url
  )

  return (
    <div
      className={cn(
        "w-full text-left rounded-xl border-2 transition-all duration-300 group/card",
        isSelected
          ? "border-[#56939F] bg-[#56939F]/5 shadow-md"
          : "hover:border-[#56939F] hover:shadow-lg",
        capacityExceeded && !isSelected && "border-amber-400"
      )}
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-3 cursor-pointer">
        <div className="flex items-start gap-3">
          <CheckIndicator isSelected={isSelected} />
          {espace.featuredImage && (
            <Image
              src={espace.featuredImage.sizes?.thumbnail ?? espace.featuredImage.url}
              alt={espace.featuredImage.alt || espace.title}
              width={56}
              height={56}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#56939F] transition-colors truncate">
              {decodeHtmlEntities(espace.title)}
            </p>
            {espace.acf.descriptif && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {toPlainText(espace.acf.descriptif)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {espace.acf.capacite_max && (
                <span
                  className={cn(
                    "text-[10px]",
                    capacityExceeded ? "text-amber-700 font-semibold" : "text-muted-foreground"
                  )}
                >
                  {espace.acf.capacite_max} pers. max
                </span>
              )}
              {espace.acf.superficie_m2 && (
                <span className="text-[10px] text-muted-foreground">
                  {espace.acf.superficie_m2} m²
                </span>
              )}
              {espace.acf.ambiance && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] rounded-full px-2 py-0.5 font-semibold",
                    AMBIANCE_CONFIG[espace.acf.ambiance].color
                  )}
                >
                  {AMBIANCE_CONFIG[espace.acf.ambiance].label}
                </Badge>
              )}
              {espace.acf.privatisable && (
                <Badge
                  variant="outline"
                  className="text-[10px] rounded-full px-2 py-0.5 font-semibold bg-[#E75754]/10 text-[#E75754] border-transparent"
                >
                  Privatisable
                </Badge>
              )}
              {capacityExceeded && (
                <Badge
                  variant="outline"
                  className="text-[10px] rounded-full px-2 py-0.5 font-semibold bg-amber-100 text-amber-800 border-transparent"
                >
                  ⚠ Capacité insuffisante
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 pt-0.5">
            {espace.acf.prix_privatisation_journee ? (
              <span className="text-xs font-bold text-[#56939F]">
                {espace.acf.prix_privatisation_journee} € / jour
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Inclus</span>
            )}
          </div>
        </div>
      </button>

      {/* Capacity warning detail */}
      {capacityExceeded && (
        <div className="px-3 pb-2 ml-8">
          <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1">
            Capacité max. {espace.acf.capacite_max} pers. — votre groupe compte {groupSize}{" "}
            personnes
          </p>
        </div>
      )}

      {/* Preview toggle */}
      {hasPreviewContent && (
        <PreviewToggle isExpanded={isPreviewExpanded} onClick={onTogglePreview} />
      )}

      {/* Expandable preview */}
      {isPreviewExpanded && (
        <ItemPreview
          description={previewDescription}
          gallery={espace.acf.galerie}
          vue360Url={espace.acf.vue_360_url}
        />
      )}
    </div>
  )
}

function ServiceCard({
  service,
  isSelected,
  onToggle,
  selectedOptionIndex,
  onOptionSelect,
  isPreviewExpanded,
  onTogglePreview,
}: {
  service: SimService
  isSelected: boolean
  onToggle: () => void
  selectedOptionIndex?: number
  onOptionSelect?: (optionIndex: number) => void
  isPreviewExpanded: boolean
  onTogglePreview: () => void
}) {
  const hasOptions = (service.acf.options?.length ?? 0) > 0
  const previewDescription =
    service.acf.description_immersive ||
    (service.acf.descriptif ? toPlainText(service.acf.descriptif) : undefined)
  const hasPreviewContent = !!(previewDescription || service.acf.galerie?.length)

  return (
    <div
      className={cn(
        "w-full text-left rounded-xl border-2 border-dashed transition-all duration-300 group/card",
        isSelected
          ? "border-[#2A4A51] border-solid bg-[#2A4A51]/5 shadow-md"
          : "hover:border-[#2A4A51] hover:shadow-lg"
      )}
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-3 cursor-pointer">
        <div className="flex items-start gap-3">
          <CheckIndicator isSelected={isSelected} />
          {service.featuredImage && (
            <Image
              src={service.featuredImage.sizes?.thumbnail ?? service.featuredImage.url}
              alt={service.featuredImage.alt || service.title}
              width={56}
              height={56}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-heading font-bold text-brand-dark group-hover/card:text-[#2A4A51] transition-colors truncate">
                {decodeHtmlEntities(service.title)}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] rounded-full px-2 py-0 font-semibold bg-[#2A4A51]/10 text-[#2A4A51] border-transparent flex-shrink-0"
              >
                Service
              </Badge>
            </div>
            {(service.acf.description_courte || service.acf.descriptif) && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {toPlainText(service.acf.description_courte || service.acf.descriptif || "")}
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
          <span className="text-xs font-bold text-[#2A4A51] flex-shrink-0 pt-0.5">
            {formatPrice(service)}
          </span>
        </div>
      </button>

      {/* Options inline picker */}
      {isSelected && hasOptions && onOptionSelect && (
        <div className="px-3 pb-3 pt-0">
          <div className="border-t border-[#2A4A51]/10 pt-2 ml-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">
              Option
            </p>
            <div className="flex flex-wrap gap-1.5">
              {service.acf.options!.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOptionSelect(idx)
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
                    selectedOptionIndex === idx
                      ? "bg-[#2A4A51] text-white shadow-sm"
                      : "bg-white border border-border hover:border-[#2A4A51]/40 text-foreground"
                  )}
                >
                  {decodeHtmlEntities(opt.nom)}
                  {opt.supplement_par_personne > 0 && (
                    <span
                      className={cn(
                        "ml-1",
                        selectedOptionIndex === idx ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      (+{opt.supplement_par_personne}€/pers.)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview toggle */}
      {hasPreviewContent && (
        <PreviewToggle isExpanded={isPreviewExpanded} onClick={onTogglePreview} />
      )}

      {/* Expandable preview */}
      {isPreviewExpanded && (
        <ItemPreview description={previewDescription} gallery={service.acf.galerie} />
      )}
    </div>
  )
}

// ─── Preview helpers ────────────────────────────────────────

function PreviewToggle({ isExpanded, onClick }: { isExpanded: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="w-full px-3 py-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors border-t border-border/30"
    >
      {isExpanded ? "Masquer l'aperçu" : "Aperçu rapide"}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
      >
        <path
          d="M2 3.5L5 6.5L8 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function ItemPreview({
  description,
  gallery,
  videoUrl,
  vue360Url,
}: {
  description?: string
  gallery?: Array<{ url: string; alt?: string; sizes?: { thumbnail?: string } }>
  videoUrl?: string
  vue360Url?: string
}) {
  const [activeMedia, setActiveMedia] = useState<"video" | "vue360" | null>(null)

  if (!description && !gallery?.length && !videoUrl && !vue360Url) return null

  const videoEmbedUrl = videoUrl ? toEmbedUrl(videoUrl) : null

  return (
    <div className="px-3 pb-3">
      <div className="border-t border-border/50 pt-2.5 ml-8 space-y-2">
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
        {gallery && gallery.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {gallery.slice(0, 5).map((img, i) => (
              <div key={i} className="relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden">
                <Image
                  src={img.sizes?.thumbnail ?? img.url}
                  alt={img.alt || `Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        )}
        {(videoUrl || vue360Url) && (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              {videoUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMedia(activeMedia === "video" ? null : "video")
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] rounded-full px-2.5 py-1 font-semibold transition-all duration-200 cursor-pointer",
                    activeMedia === "video"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                  )}
                >
                  ▶ {activeMedia === "video" ? "Masquer" : "Voir la vidéo"}
                </button>
              )}
              {vue360Url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMedia(activeMedia === "vue360" ? null : "vue360")
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] rounded-full px-2.5 py-1 font-semibold transition-all duration-200 cursor-pointer",
                    activeMedia === "vue360"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  )}
                >
                  {activeMedia === "vue360" ? "Masquer" : "Vue 360°"}
                </button>
              )}
            </div>

            {/* Inline video embed */}
            {activeMedia === "video" && videoEmbedUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5">
                <iframe
                  src={videoEmbedUrl}
                  title="Vidéo teaser"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>
            )}
            {activeMedia === "video" && !videoEmbedUrl && videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[10px] text-purple-700 hover:underline"
              >
                Ouvrir la vidéo dans un nouvel onglet
              </a>
            )}

            {/* Inline 360° embed */}
            {activeMedia === "vue360" && vue360Url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5">
                <iframe
                  src={vue360Url}
                  title="Visite virtuelle 360°"
                  allow="accelerometer; gyroscope; xr-spatial-tracking"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Converts a YouTube or Vimeo URL to its embeddable iframe URL.
 * Returns null if the URL format is not recognized.
 */
function toEmbedUrl(url: string): string | null {
  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}
