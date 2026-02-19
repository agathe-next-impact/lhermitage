import type { SimulateurState, SimulateurData, SimulateurSettings, BudgetBreakdown } from "./types"
import { DEFAULT_SETTINGS } from "./constants"

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
  }

  const total = base + activites + espaces + hebergements + services

  return {
    base,
    activites,
    espaces,
    hebergements,
    services,
    total,
    par_personne: groupSize > 0 ? Math.round(total / groupSize) : 0,
    par_personne_par_jour:
      groupSize > 0 && duration > 0 ? Math.round(total / groupSize / duration) : 0,
  }
}
