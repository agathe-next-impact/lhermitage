"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { calculateBudget } from "@/lib/simulateur/pricing"
import { cn } from "@/lib/utils"

const BUDGET_LINES: {
  key: "base" | "activites" | "espaces" | "hebergements" | "services"
  label: string
}[] = [
  { key: "base", label: "Base séjour" },
  { key: "activites", label: "Activités" },
  { key: "espaces", label: "Espaces" },
  { key: "hebergements", label: "Hébergements" },
  { key: "services", label: "Services" },
]

function formatEuros(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BudgetSidebar() {
  const profile = useSimulateurStore((s) => s.profile)
  const days = useSimulateurStore((s) => s.days)
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const selectedServices = useSimulateurStore((s) => s.selectedServices)
  const data = useSimulateurData()

  const budget = useMemo(
    () =>
      calculateBudget(
        { profile, days, accommodations, selectedServices, currentStep: "experience" },
        data,
        data.settings
      ),
    [profile, days, accommodations, selectedServices, data]
  )

  return (
    <div className="rounded-2xl border shadow-sm bg-white p-5 space-y-4">
      <div className="text-center space-y-1">
        <p className="font-heading uppercase text-xs font-bold tracking-wider text-muted-foreground mb-3">
          Budget estimé
        </p>
        <motion.p
          key={budget.total}
          initial={{ scale: 0.95, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-3xl font-extrabold text-[#2A4A51]"
        >
          {formatEuros(budget.total)}
        </motion.p>
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>{formatEuros(budget.par_personne)} / pers.</span>
          <span className="w-px h-3 bg-border" />
          <span>{formatEuros(budget.par_personne_par_jour)} / pers. / jour</span>
        </div>
      </div>

      <div className="border-t" />

      <ul className="space-y-2">
        {BUDGET_LINES.map(({ key, label }) => {
          const amount = budget[key]
          return (
            <li
              key={key}
              className={cn(
                "flex items-center justify-between text-sm",
                amount === 0 ? "text-muted-foreground/30" : "text-foreground"
              )}
            >
              <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
              <span
                className={cn(
                  "tabular-nums",
                  amount === 0 ? "text-muted-foreground/30" : "font-bold text-brand-dark"
                )}
              >
                {formatEuros(amount)}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Coefficient saisonnier */}
      {budget.coefficient > 1 && (
        <>
          <div className="border-t" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-xs uppercase tracking-wider font-medium text-amber-700">
              {budget.coefficient_label || "Majoration"}
            </span>
            <span className="tabular-nums font-bold text-amber-700">
              x{budget.coefficient.toFixed(2)}
            </span>
          </div>
        </>
      )}

      <div className="border-t" />

      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-xs uppercase tracking-wider font-medium">Total</span>
        <span className="text-[#2A4A51] tabular-nums font-extrabold">
          {formatEuros(budget.total)}
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center leading-tight">
        Estimation indicative, hors taxes. Le devis final sera ajusté par notre équipe.
      </p>
    </div>
  )
}
