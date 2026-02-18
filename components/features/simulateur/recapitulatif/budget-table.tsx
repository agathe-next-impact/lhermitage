"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { calculateBudget } from "@/lib/simulateur/pricing"
import { cn } from "@/lib/utils"

function formatEuros(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BudgetTable() {
  const profile = useSimulateurStore((s) => s.profile)
  const days = useSimulateurStore((s) => s.days)
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const selectedServices = useSimulateurStore((s) => s.selectedServices)
  const selectedEspaces = useSimulateurStore((s) => s.selectedEspaces)
  const data = useSimulateurData()

  const budget = useMemo(
    () =>
      calculateBudget(
        { profile, days, accommodations, selectedServices, selectedEspaces, currentStep: "recapitulatif" },
        data,
        data.settings
      ),
    [profile, days, accommodations, selectedServices, selectedEspaces, data]
  )

  const groupSize = profile.groupSize || 1
  const duration = profile.duration || 1
  const nights = Math.max(0, duration - 1)
  const priceBase = data.settings.prix_base_journee_personne

  // Build detail lines for activities
  const activityLines = useMemo(() => {
    const lines: Array<{ label: string; detail: string; amount: number }> = []
    for (const day of days) {
      for (const slot of day.slots) {
        if (!slot.activite_slug) continue
        const act = data.activites.find((a) => a.slug === slot.activite_slug)
        if (!act?.acf) continue

        if (act.acf.mode_tarification === "forfaitaire" && act.acf.prix_forfaitaire) {
          lines.push({
            label: act.acf.nom,
            detail: `forfait ${formatEuros(act.acf.prix_forfaitaire)}`,
            amount: act.acf.prix_forfaitaire,
          })
        } else if (act.acf.prix_par_personne) {
          const total = act.acf.prix_par_personne * groupSize
          lines.push({
            label: act.acf.nom,
            detail: `${formatEuros(act.acf.prix_par_personne)} x ${groupSize} pers.`,
            amount: total,
          })
        }
      }
    }
    return lines
  }, [days, data.activites, groupSize])

  // Build detail lines for espaces
  const espaceLines = useMemo(() => {
    const used = new Set<string>()
    const lines: Array<{ label: string; detail: string; amount: number }> = []
    for (const day of days) {
      for (const slot of day.slots) {
        if (!slot.espace_slug || used.has(slot.espace_slug)) continue
        used.add(slot.espace_slug)
        const esp = data.espaces.find((e) => e.slug === slot.espace_slug)
        if (esp?.acf?.privatisable && esp.acf.prix_privatisation_journee) {
          const total = esp.acf.prix_privatisation_journee * duration
          lines.push({
            label: esp.acf.nom,
            detail: `${formatEuros(esp.acf.prix_privatisation_journee)}/j x ${duration} j`,
            amount: total,
          })
        }
      }
    }
    return lines
  }, [days, data.espaces, duration])

  // Build detail lines for hebergements
  const hebergementLines = useMemo(() => {
    return accommodations
      .map((acc) => {
        const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
        if (!heb?.acf?.prix_nuit_unite) return null
        const total = heb.acf.prix_nuit_unite * acc.quantity * nights
        return {
          label: heb.acf.nom,
          detail: `${formatEuros(heb.acf.prix_nuit_unite)} x ${acc.quantity} unit. x ${nights} nuit${nights > 1 ? "s" : ""}`,
          amount: total,
        }
      })
      .filter(Boolean) as Array<{ label: string; detail: string; amount: number }>
  }, [accommodations, data.hebergements, nights])

  // Build detail lines for services
  const serviceLines = useMemo(() => {
    return selectedServices
      .map((sel) => {
        const svc = data.services.find((sv) => sv.slug === sel.service_slug)
        if (!svc?.acf) return null

        if (svc.acf.mode_tarification === "forfaitaire" && svc.acf.prix_forfaitaire) {
          return {
            label: svc.acf.nom,
            detail: `forfait ${formatEuros(svc.acf.prix_forfaitaire)}`,
            amount: svc.acf.prix_forfaitaire,
          }
        } else if (svc.acf.prix_par_personne) {
          const total = svc.acf.prix_par_personne * groupSize
          return {
            label: svc.acf.nom,
            detail: `${formatEuros(svc.acf.prix_par_personne)} x ${groupSize} pers.`,
            amount: total,
          }
        }
        return null
      })
      .filter(Boolean) as Array<{ label: string; detail: string; amount: number }>
  }, [selectedServices, data.services, groupSize])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className="font-heading uppercase font-extrabold text-2xl text-[#2A4A51] tracking-wide">
        Budget estimatif
      </h2>

      <div className="rounded-2xl border shadow-sm overflow-hidden">
        {/* Base */}
        <BudgetSection
          title="Base s\u00e9jour"
          subtitle={`${formatEuros(priceBase)} x ${groupSize} pers. x ${duration} j`}
          amount={budget.base}
        />

        {/* Activit\u00e9s */}
        {activityLines.length > 0 && (
          <BudgetSection title="Activit\u00e9s" amount={budget.activites}>
            {activityLines.map((line, i) => (
              <BudgetDetailLine
                key={i}
                label={line.label}
                detail={line.detail}
                amount={line.amount}
              />
            ))}
          </BudgetSection>
        )}

        {/* Espaces */}
        {espaceLines.length > 0 && (
          <BudgetSection title="Espaces privatis\u00e9s" amount={budget.espaces}>
            {espaceLines.map((line, i) => (
              <BudgetDetailLine
                key={i}
                label={line.label}
                detail={line.detail}
                amount={line.amount}
              />
            ))}
          </BudgetSection>
        )}

        {/* H\u00e9bergements */}
        {hebergementLines.length > 0 && (
          <BudgetSection title="H\u00e9bergements" amount={budget.hebergements}>
            {hebergementLines.map((line, i) => (
              <BudgetDetailLine
                key={i}
                label={line.label}
                detail={line.detail}
                amount={line.amount}
              />
            ))}
          </BudgetSection>
        )}

        {/* Services */}
        {serviceLines.length > 0 && (
          <BudgetSection title="Services" amount={budget.services}>
            {serviceLines.map((line, i) => (
              <BudgetDetailLine
                key={i}
                label={line.label}
                detail={line.detail}
                amount={line.amount}
              />
            ))}
          </BudgetSection>
        )}

        {/* Total */}
        <div className="bg-[#2A4A51] text-white px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-heading uppercase font-bold tracking-wider">
            Total estim\u00e9
          </span>
          <span className="text-2xl font-extrabold text-[#E75754]">
            {formatEuros(budget.total)}
          </span>
        </div>

        {/* Per person metrics */}
        <div className="bg-muted/50 px-6 py-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <span className="font-semibold text-foreground">
                {formatEuros(budget.par_personne)}
              </span>{" "}
              / personne
            </span>
            <span className="w-px h-4 bg-border" />
            <span>
              <span className="font-semibold text-foreground">
                {formatEuros(budget.par_personne_par_jour)}
              </span>{" "}
              / personne / jour
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60 text-center leading-tight">
        Estimation indicative, hors taxes. Le devis final sera ajust\u00e9 par notre \u00e9quipe en
        fonction de vos besoins sp\u00e9cifiques.
      </p>
    </motion.div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function BudgetSection({
  title,
  subtitle,
  amount,
  children,
}: {
  title: string
  subtitle?: string
  amount: number
  children?: React.ReactNode
}) {
  return (
    <div className="border-b last:border-0">
      <div
        className={cn(
          "px-6 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors",
          amount === 0 && "opacity-40"
        )}
      >
        <div>
          <span className="font-heading uppercase text-xs tracking-wider font-bold text-[#2A4A51]">
            {title}
          </span>
          {subtitle && <span className="ml-2 text-xs text-muted-foreground">({subtitle})</span>}
        </div>
        <span className="font-mono tabular-nums font-bold text-[#2A4A51]">
          {formatEuros(amount)}
        </span>
      </div>
      {children && <div className="px-6 pb-3 space-y-1">{children}</div>}
    </div>
  )
}

function BudgetDetailLine({
  label,
  detail,
  amount,
}: {
  label: string
  detail: string
  amount: number
}) {
  return (
    <div className="flex items-center justify-between text-sm pl-4 py-1 border-l-2 border-[#E75754]/20">
      <div className="flex items-center gap-2">
        <span className="text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">({detail})</span>
      </div>
      <span className="font-mono tabular-nums font-medium text-foreground">
        {formatEuros(amount)}
      </span>
    </div>
  )
}
