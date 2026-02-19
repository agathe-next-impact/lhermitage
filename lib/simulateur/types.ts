import type { WPImage, WPLink } from "@/lib/wordpress/types"

// ─── Catégories de séjour ────────────────────────────────────

export type SejourCategory =
  | "cohesion-team-building"
  | "seminaire-strategique"
  | "incentive-recompense"
  | "deconnexion-bien-etre"
  | "onboarding-integration"

export const SEJOUR_CATEGORIES: Record<
  SejourCategory,
  { label: string; emoji: string; description: string }
> = {
  "cohesion-team-building": {
    label: "Cohésion & Team Building",
    emoji: "🤝",
    description: "Renforcez les liens entre vos collaborateurs par des activités partagées",
  },
  "seminaire-strategique": {
    label: "Séminaire stratégique",
    emoji: "🎯",
    description: "Combinez travail productif et moments de détente dans un cadre inspirant",
  },
  "incentive-recompense": {
    label: "Incentive & Récompense",
    emoji: "🏆",
    description: "Offrez une expérience mémorable pour récompenser vos équipes",
  },
  "deconnexion-bien-etre": {
    label: "Déconnexion & Bien-être",
    emoji: "🌿",
    description: "Un break ressourçant au cœur de la nature pour vos collaborateurs",
  },
  "onboarding-integration": {
    label: "Onboarding & Intégration",
    emoji: "🚀",
    description: "Accueillez vos nouvelles recrues avec un séjour fédérateur",
  },
}

// ─── Créneaux horaires ───────────────────────────────────────

export type CreneauType = "matin" | "apres_midi" | "soiree"
export type TypeCreneau = "activite" | "repas" | "travail" | "libre" | "soiree"
export type NiveauPhysique = "faible" | "modere" | "intense"
export type ModeTarification = "par_personne" | "forfaitaire"
export type NiveauConfort = "standard" | "confort" | "premium"
export type Ambiance = "professionnel" | "decontracte" | "intimiste" | "festif"
export type LieuType = "interieur" | "exterieur" | "les_deux"

// ─── ACF étendues pour le simulateur ─────────────────────────

export interface ActiviteSimACF {
  nom: string
  descriptif?: string
  duree_minutes?: number
  capacite_min?: number
  capacite_max?: number
  prix_par_personne?: number
  prix_forfaitaire?: number
  mode_tarification?: ModeTarification
  creneau_suggere?: CreneauType | "journee"
  creneaux_disponibles?: string[]
  description_immersive?: string
  galerie?: WPImage[]
  video_teaser_url?: string
  niveau_physique?: NiveauPhysique
  interieur_exterieur?: LieuType
  coordonnees_plan?: { x: number; y: number }
}

export interface HebergementSimACF {
  nom: string
  descriptif?: string
  capacite_personnes?: number
  nombre_unites?: number
  prix_nuit_unite?: number
  niveau_confort?: NiveauConfort
  equipements_chambre?: string[]
  description_immersive?: string
  galerie?: WPImage[]
  coordonnees_plan?: { x: number; y: number }
  zone_plan_svg_id?: string
}

export interface EspaceSimACF {
  nom: string
  descriptif?: string
  capacite_max?: number
  superficie_m2?: number
  privatisable?: boolean
  prix_privatisation_journee?: number
  equipements?: string[]
  ambiance?: Ambiance
  description_immersive?: string
  galerie?: WPImage[]
  vue_360_url?: string
  coordonnees_plan?: { x: number; y: number }
  zone_plan_svg_id?: string
}

export interface ServiceSimACF {
  nom: string
  descriptif?: string
  prix_par_personne?: number
  prix_forfaitaire?: number
  mode_tarification?: ModeTarification
  inclus_par_defaut?: boolean
  creneaux_disponibles?: string[]
  description_courte?: string
  description_immersive?: string
  galerie?: WPImage[]
  options?: Array<{ nom: string; supplement_par_personne: number }>
}

export interface SejourTemplateACF {
  duree_jours?: number
  description_promesse?: string
  image_hero?: WPImage
  programme_defaut?: ProgrammeJour[]
}

export interface ProgrammeJour {
  jour_numero: number
  creneaux: ProgrammeCreneau[]
}

export interface ProgrammeCreneau {
  creneau: string // clé de CRENEAU_ORDER, ex: "matin", "dejeuner", "apres_midi"
  activite_suggeree?: { slug: string; title: string }
  espace_suggere?: { slug: string; title: string }
  service_suggere?: { slug: string; title: string }
  label_personnalise?: string
}

// ─── Entités résolues (avec slug + metadata) ─────────────────

export interface SimActivite {
  slug: string
  title: string
  featuredImage?: WPImage
  acf: ActiviteSimACF
  types?: Array<{ slug: string; name: string }>
}

export interface SimHebergement {
  slug: string
  title: string
  featuredImage?: WPImage
  acf: HebergementSimACF
  types?: Array<{ slug: string; name: string }>
}

export interface SimEspace {
  slug: string
  title: string
  featuredImage?: WPImage
  acf: EspaceSimACF
  types?: Array<{ slug: string; name: string }>
}

export interface SimService {
  slug: string
  title: string
  featuredImage?: WPImage
  acf: ServiceSimACF
  categories?: Array<{ slug: string; name: string }>
}

export interface SimSejourTemplate {
  slug: string
  title: string
  featuredImage?: WPImage
  acf: SejourTemplateACF
  category?: SejourCategory
}

// ─── Paramètres globaux du simulateur ────────────────────────

export interface SimulateurSettings {
  nom_lieu: string
  description_lieu?: string
  plan_domaine_svg_url?: string
  capacite_totale_max: number
  prix_base_journee_personne: number
  coefficient_weekend: number
  coefficient_haute_saison: number
  periodes_haute_saison?: Array<{ date_debut: string; date_fin: string }>
  email_commercial?: string
  telephone_commercial?: string
  equipements_disponibles?: Array<{ slug: string; label: string }>
  ambiances_disponibles?: Array<{ slug: string; label: string }>
}

// ─── État du simulateur (store) ──────────────────────────────

export interface SimulateurProfile {
  category: SejourCategory | null
  templateSlug: string | null
  groupSize: number
  duration: number
  budgetMax: number
  startDate: string | null
  contactName: string
  contactEmail: string
  contactCompany: string
  contactPhone: string
}

export interface TimeSlot {
  id: string
  heure_debut: string
  type_creneau: TypeCreneau
  activite_slugs?: string[]
  espace_slugs?: string[]
  service_slugs?: string[]
  label_personnalise?: string
}

export interface DayProgram {
  dayNumber: number
  slots: TimeSlot[]
}

export interface AccommodationSelection {
  hebergement_slug: string
  quantity: number
}

export interface ServiceSelection {
  service_slug: string
  option_index?: number
}

export interface BudgetBreakdown {
  base: number
  activites: number
  espaces: number
  hebergements: number
  services: number
  coefficient: number // multiplicateur saisonnier/weekend appliqué (1 = aucun)
  coefficient_label?: string // ex: "Haute saison", "Weekend"
  sous_total: number // avant coefficient
  total: number
  par_personne: number
  par_personne_par_jour: number
}

export type SimulateurStep = "profil" | "experience" | "hebergements" | "recapitulatif"

export interface SimulateurState {
  // Profil
  profile: SimulateurProfile
  // Programme
  days: DayProgram[]
  // Hébergements
  accommodations: AccommodationSelection[]
  // Services
  selectedServices: ServiceSelection[]
  // Navigation
  currentStep: SimulateurStep
}

// ─── Résultat de soumission de devis ─────────────────────────

export interface SubmitQuoteResult {
  success: boolean
  devisId?: number
  error?: string
}

// ─── Données contextuelles (chargées depuis WP) ─────────────

export interface SimulateurData {
  activites: SimActivite[]
  hebergements: SimHebergement[]
  espaces: SimEspace[]
  services: SimService[]
  templates: SimSejourTemplate[]
  settings: SimulateurSettings
}
