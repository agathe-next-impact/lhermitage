import type { SimulateurStep, TypeCreneau } from "./types"

export const STEPS: { key: SimulateurStep; label: string; path: string }[] = [
  { key: "profil", label: "Profil", path: "/simulateur/profil" },
  { key: "experience", label: "Expérience", path: "/simulateur/experience" },
  { key: "hebergements", label: "Hébergements", path: "/simulateur/hebergements" },
  { key: "services", label: "Espaces de travail", path: "/simulateur/services" },
  { key: "recapitulatif", label: "Récapitulatif", path: "/simulateur/recapitulatif" },
]

export const DEFAULT_GROUP_SIZE = 20
export const MIN_GROUP_SIZE = 5
export const MAX_GROUP_SIZE = 200
export const GROUP_SIZE_STEP = 5

export const DEFAULT_DURATION = 2
export const MIN_DURATION = 1
export const MAX_DURATION = 5

export const DEFAULT_BUDGET_MAX = 15000

/** Créneaux horaires par défaut pour chaque journée */
export const DEFAULT_DAY_SLOTS = [
  { heure_debut: "09:00", type_creneau: "activite" as const, label: "Matinée" },
  { heure_debut: "12:30", type_creneau: "repas" as const, label: "Déjeuner" },
  { heure_debut: "14:30", type_creneau: "activite" as const, label: "Après-midi" },
  { heure_debut: "19:30", type_creneau: "soiree" as const, label: "Soirée" },
]

/** Ordre et labels des créneaux horaires */
export const CRENEAU_ORDER = [
  "petit_dejeuner",
  "matin",
  "dejeuner",
  "apres_midi",
  "diner",
  "soir",
] as const

export const CRENEAU_LABELS: Record<string, string> = {
  petit_dejeuner: "Petit déjeuner",
  matin: "Matin",
  dejeuner: "Déjeuner",
  apres_midi: "Après-midi",
  diner: "Dîner",
  soir: "Soir",
}

/** Configuration de chaque créneau horaire : heure de début et type par défaut */
export const CRENEAU_SLOT_DEFAULTS: Record<string, { heure_debut: string; type_creneau: TypeCreneau }> = {
  petit_dejeuner: { heure_debut: "07:30", type_creneau: "repas" },
  matin: { heure_debut: "09:00", type_creneau: "activite" },
  dejeuner: { heure_debut: "12:30", type_creneau: "repas" },
  apres_midi: { heure_debut: "14:30", type_creneau: "activite" },
  diner: { heure_debut: "19:30", type_creneau: "repas" },
  soir: { heure_debut: "21:00", type_creneau: "soiree" },
}

/** Prix de base par défaut (utilisé si WP ne fournit pas de settings) */
export const DEFAULT_SETTINGS = {
  nom_lieu: "L'Hermitage",
  capacite_totale_max: 200,
  prix_base_journee_personne: 95,
  coefficient_weekend: 1.15,
  coefficient_haute_saison: 1.25,
} as const
