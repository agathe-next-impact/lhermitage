import type { SimulateurState, SimulateurData, SimulateurSettings, BudgetBreakdown } from "./types"
import { DEFAULT_SETTINGS } from "./constants"

/**
 * Determine si une date tombe un weekend (samedi ou dimanche).
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Determine si une date tombe dans une période de haute saison.
 */
function isHauteSaison(
  date: Date,
  periodes?: Array<{ date_debut: string; date_fin: string }>
): boolean {
  if (!periodes?.length) return false
  const ts = date.getTime()
  for (const p of periodes) {
    if (!p.date_debut || !p.date_fin) continue
    const start = new Date(p.date_debut).getTime()
    const end = new Date(p.date_fin).getTime()
    if (ts >= start && ts <= end) return true
  }
  return false
}

/**
 * Calcule le coefficient saisonnier à appliquer en fonction de la date de début.
 * Retourne { coefficient, label } — coefficient 1 si aucune majoration.
 */
function computeSeasonCoefficient(
  startDate: string | null,
  duration: number,
  settings: SimulateurSettings
): { coefficient: number; label?: string } {
  if (!startDate) return { coefficient: 1 }

  const start = new Date(startDate)
  if (isNaN(start.getTime())) return { coefficient: 1 }

  // Check each day of the stay
  let hasWeekend = false
  let hasHauteSaison = false
  for (let i = 0; i < duration; i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + i)
    if (isWeekend(day)) hasWeekend = true
    if (isHauteSaison(day, settings.periodes_haute_saison)) hasHauteSaison = true
  }

  // Apply the highest applicable coefficient (not cumulative)
  const coefWeekend = hasWeekend ? (settings.coefficient_weekend ?? 1) : 1
  const coefSaison = hasHauteSaison ? (settings.coefficient_haute_saison ?? 1) : 1

  if (coefSaison > 1 && coefWeekend > 1) {
    // Both apply — use the higher one
    const max = Math.max(coefSaison, coefWeekend)
    return {
      coefficient: max,
      label: max === coefSaison ? "Haute saison + weekend" : "Weekend + haute saison",
    }
  }
  if (coefSaison > 1) {
    return { coefficient: coefSaison, label: "Haute saison" }
  }
  if (coefWeekend > 1) {
    return { coefficient: coefWeekend, label: "Weekend" }
  }

  return { coefficient: 1 }
}

/**
 * Calcule le budget complet à partir du state du simulateur et des données WP.
 * Fonction pure, testable sans React.
 */
export function calculateBudget(
  state: SimulateurState,
  data: SimulateurData,
  settings?: SimulateurSettings
): BudgetBreakdown {
  const s = settings ?? (DEFAULT_SETTINGS as unknown as SimulateurSettings)
  const { profile, days, accommodations, selectedServices } = state
  const groupSize = profile.groupSize || 1
  const duration = profile.duration || 1

  // 1. Base : prix/pers/jour × groupe × durée
  const base = s.prix_base_journee_personne * groupSize * duration

  // 2. Activités
  let activites = 0
  for (const day of days) {
    for (const slot of day.slots) {
      for (const slug of slot.activite_slugs ?? []) {
        const act = data.activites.find((a) => a.slug === slug)
        if (!act?.acf) continue
        if (act.acf.mode_tarification === "forfaitaire" && act.acf.prix_forfaitaire) {
          activites += act.acf.prix_forfaitaire
        } else if (act.acf.prix_par_personne) {
          activites += act.acf.prix_par_personne * groupSize
        }
      }
    }
  }

  // 3. Espaces privatisés
  let espaces = 0
  const usedEspaces = new Set<string>()
  for (const day of days) {
    for (const slot of day.slots) {
      for (const slug of slot.espace_slugs ?? []) {
        usedEspaces.add(slug)
      }
    }
  }
  for (const espaceSlug of usedEspaces) {
    const esp = data.espaces.find((e) => e.slug === espaceSlug)
    if (esp?.acf?.privatisable && esp.acf.prix_privatisation_journee) {
      espaces += esp.acf.prix_privatisation_journee * duration
    }
  }

  // 4. Hébergements : prix × quantité × (durée - 1) nuits
  const nights = Math.max(0, duration - 1)
  let hebergements = 0
  for (const acc of accommodations) {
    const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
    if (heb?.acf?.prix_nuit_unite) {
      hebergements += heb.acf.prix_nuit_unite * acc.quantity * nights
    }
  }

  // 5. Services
  let services = 0
  for (const sel of selectedServices) {
    const svc = data.services.find((sv) => sv.slug === sel.service_slug)
    if (!svc?.acf) continue
    if (svc.acf.mode_tarification === "forfaitaire" && svc.acf.prix_forfaitaire) {
      services += svc.acf.prix_forfaitaire
    } else if (svc.acf.prix_par_personne) {
      services += svc.acf.prix_par_personne * groupSize
    }
    // Supplément d'option
    if (sel.option_index !== undefined && svc.acf.options?.[sel.option_index]) {
      const supplement = svc.acf.options[sel.option_index].supplement_par_personne
      if (supplement) {
        services += supplement * groupSize
      }
    }
  }

  const sous_total = base + activites + espaces + hebergements + services

  // 6. Coefficient saisonnier / weekend
  const { coefficient, label: coefficient_label } = computeSeasonCoefficient(
    profile.startDate,
    duration,
    s
  )

  const total = Math.round(sous_total * coefficient)

  return {
    base,
    activites,
    espaces,
    hebergements,
    services,
    coefficient,
    coefficient_label,
    sous_total,
    total,
    par_personne: groupSize > 0 ? Math.round(total / groupSize) : 0,
    par_personne_par_jour:
      groupSize > 0 && duration > 0 ? Math.round(total / groupSize / duration) : 0,
  }
}
