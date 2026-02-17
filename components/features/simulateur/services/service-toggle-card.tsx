"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SimService } from "@/lib/simulateur/types"

interface ServiceToggleCardProps {
  service: SimService
  isSelected: boolean
  optionIndex?: number
  onToggle: () => void
  onOptionChange: (idx: number) => void
}

export function ServiceToggleCard({
  service,
  isSelected,
  optionIndex,
  onToggle,
  onOptionChange,
}: ServiceToggleCardProps) {
  const { acf } = service
  const isInclus = acf.inclus_par_defaut === true

  const priceLabel = (() => {
    if (acf.mode_tarification === "forfaitaire" && acf.prix_forfaitaire != null) {
      return `${acf.prix_forfaitaire}\u20AC forfait`
    }
    if (acf.prix_par_personne != null) {
      return `${acf.prix_par_personne}\u20AC/pers`
    }
    return null
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border shadow-sm bg-card p-5 hover:shadow-md transition-all",
        isSelected && "border-[#2A4A51] bg-[#2A4A51]/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-brand-dark">{acf.nom || service.title}</h3>
            {isInclus && (
              <Badge className="rounded-full bg-[#78AD7D]/10 text-[#78AD7D] border-[#78AD7D]/30 text-xs font-bold">
                Inclus
              </Badge>
            )}
          </div>

          {(acf.description_courte || acf.descriptif) && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {acf.description_courte || acf.descriptif}
            </p>
          )}

          {priceLabel && <p className="text-sm font-bold text-[#2A4A51] mt-2">{priceLabel}</p>}
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isSelected}
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            isSelected ? "bg-[#2A4A51]" : "bg-gray-200"
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

      {/* Options (when selected and has options) */}
      {isSelected && acf.options && acf.options.length > 0 && (
        <div className="mt-4 pt-3 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Options disponibles
          </p>
          {acf.options.map((option, idx) => (
            <label
              key={idx}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                optionIndex === idx
                  ? "border-[#2A4A51] bg-[#2A4A51]/5"
                  : "border-border hover:border-[#2A4A51]/40"
              )}
            >
              <input
                type="radio"
                name={`option-${service.slug}`}
                checked={optionIndex === idx}
                onChange={() => onOptionChange(idx)}
                className="accent-[#2A4A51]"
              />
              <span className="flex-1 text-sm font-medium">{option.nom}</span>
              {option.supplement_par_personne > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{option.supplement_par_personne}&euro;/pers
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </motion.div>
  )
}
