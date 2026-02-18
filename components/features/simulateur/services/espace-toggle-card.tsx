"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SimEspace, Ambiance } from "@/lib/simulateur/types"

interface EspaceToggleCardProps {
  espace: SimEspace
  isSelected: boolean
  privatise: boolean
  onToggle: () => void
  onPrivatiseChange: (privatise: boolean) => void
}

const AMBIANCE_CONFIG: Record<Ambiance, { label: string; color: string }> = {
  professionnel: {
    label: "Professionnel",
    color: "bg-[#56939F]/15 text-[#56939F] border-transparent",
  },
  decontracte: {
    label: "Décontracté",
    color: "bg-[#78AD7D]/15 text-[#78AD7D] border-transparent",
  },
  intimiste: {
    label: "Intimiste",
    color: "bg-[#2A4A51]/10 text-[#2A4A51] border-transparent",
  },
  festif: {
    label: "Festif",
    color: "bg-[#DC6F45]/15 text-[#DC6F45] border-transparent",
  },
}

export function EspaceToggleCard({
  espace,
  isSelected,
  privatise,
  onToggle,
  onPrivatiseChange,
}: EspaceToggleCardProps) {
  const { acf } = espace

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border shadow-sm bg-card p-5 hover:shadow-md transition-all",
        isSelected && "border-[#56939F] bg-[#56939F]/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-brand-dark">
              {acf.nom || espace.title}
            </h3>
            {acf.ambiance && (
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full text-xs font-semibold",
                  AMBIANCE_CONFIG[acf.ambiance].color
                )}
              >
                {AMBIANCE_CONFIG[acf.ambiance].label}
              </Badge>
            )}
          </div>

          {acf.descriptif && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {acf.descriptif}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {acf.capacite_max && (
              <span className="text-xs text-muted-foreground">
                {acf.capacite_max} pers. max
              </span>
            )}
            {acf.superficie_m2 && (
              <span className="text-xs text-muted-foreground">
                {acf.superficie_m2} m&sup2;
              </span>
            )}
            {acf.privatisable && (
              <Badge
                variant="outline"
                className="text-xs rounded-full font-semibold bg-[#E75754]/10 text-[#E75754] border-transparent"
              >
                Privatisable
              </Badge>
            )}
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isSelected}
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            isSelected ? "bg-[#56939F]" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 rounded-full shadow-sm transition-transform",
              isSelected ? "translate-x-5 bg-white" : "translate-x-0.5 bg-gray-400"
            )}
          />
        </button>
      </div>

      {/* Privatisation option (when selected and privatisable) */}
      {isSelected && acf.privatisable && (
        <div className="mt-4 pt-3 border-t">
          <label className={cn(
            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
            privatise
              ? "border-[#56939F] bg-[#56939F]/5"
              : "border-border hover:border-[#56939F]/40"
          )}>
            <input
              type="checkbox"
              checked={privatise}
              onChange={(e) => onPrivatiseChange(e.target.checked)}
              className="accent-[#56939F]"
            />
            <span className="flex-1 text-sm font-medium">Privatiser cet espace</span>
            {acf.prix_privatisation_journee && (
              <span className="text-xs text-muted-foreground">
                {acf.prix_privatisation_journee}&euro;/jour
              </span>
            )}
          </label>
        </div>
      )}
    </motion.div>
  )
}
