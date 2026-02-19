import { transformImage, transformImages } from "@/lib/wordpress/graphql/transformers"
import { transformContentLinks } from "@/lib/wordpress/transform-content"
import type {
  SimActivite,
  SimHebergement,
  SimEspace,
  SimService,
  SimSejourTemplate,
  SimulateurSettings,
  ProgrammeJour,
  ProgrammeCreneau,
  SejourCategory,
} from "@/lib/simulateur/types"

// --- Helper: unwrap ACF select fields that WPGraphQL returns as arrays ---

function unwrapSelect<T extends string>(value: T | T[] | null | undefined): T | undefined {
  if (Array.isArray(value)) return value[0] as T | undefined
  return value ?? undefined
}

// --- Helper: transform AcfMediaItemConnection { nodes: MediaItem[] } ---

function transformAcfMediaConnection(
  conn: { nodes?: any[] } | any[] | null | undefined
): ReturnType<typeof transformImages> {
  if (!conn) return []
  const items = Array.isArray(conn) ? conn : conn.nodes
  if (!items) return []
  return transformImages(items)
}

// --- Helper: transform AcfMediaItemConnectionEdge { node: MediaItem } ---

function transformAcfMediaEdge(
  edge: { node?: any } | any | null | undefined
): ReturnType<typeof transformImage> {
  if (!edge) return undefined
  const item = (edge as any).node || edge
  if (!item?.sourceUrl) return undefined
  return transformImage(item)
}

// --- Activité (simulateur) ---
// Merges existing "activites" field group + new "activiteSimulateur" field group

export function transformActiviteSim(gqlPost: any): SimActivite {
  const existing = gqlPost.activites
  const sim = gqlPost.activiteSimulateur

  const types = gqlPost.activiteTypes?.nodes?.map((t: any) => ({
    slug: t.slug,
    name: t.name,
  }))

  return {
    slug: gqlPost.slug,
    title: gqlPost.title || "",
    featuredImage: transformAcfMediaEdge(gqlPost.featuredImage),
    acf: {
      nom: existing?.nom || gqlPost.title || "",
      descriptif: transformContentLinks(existing?.descriptif || ""),
      duree_minutes: sim?.dureeMinutes ?? undefined,
      capacite_min: sim?.capaciteMin ?? undefined,
      capacite_max: sim?.capaciteMax ?? undefined,
      prix_par_personne: sim?.prixParPersonne ?? undefined,
      prix_forfaitaire: sim?.prixForfaitaire ?? undefined,
      mode_tarification: unwrapSelect(sim?.modeTarification),
      creneau_suggere: unwrapSelect(sim?.creneauSuggere),
      creneaux_disponibles: sim?.creneauxDisponibles ?? undefined,
      description_immersive: sim?.descriptionImmersive ?? undefined,
      galerie: transformAcfMediaConnection(sim?.galerie),
      video_teaser_url: sim?.videoTeaserUrl ?? undefined,
      niveau_physique: unwrapSelect(sim?.niveauPhysique),
      interieur_exterieur: unwrapSelect(sim?.interieurExterieur),
      coordonnees_plan: sim?.coordonneesPlan
        ? { x: sim.coordonneesPlan.x, y: sim.coordonneesPlan.y }
        : undefined,
    },
    types: types?.length ? types : undefined,
  }
}

// --- Hébergement (simulateur) ---
// Merges existing "hebergements" field group + new "hebergementSimulateur" field group

export function transformHebergementSim(gqlPost: any): SimHebergement {
  const existing = gqlPost.hebergements
  const sim = gqlPost.hebergementSimulateur

  return {
    slug: gqlPost.slug,
    title: gqlPost.title || "",
    featuredImage: transformAcfMediaEdge(gqlPost.featuredImage),
    acf: {
      nom: existing?.nom || gqlPost.title || "",
      descriptif: transformContentLinks(existing?.descriptif || ""),
      capacite_personnes: sim?.capacitePersonnes ?? undefined,
      nombre_unites: sim?.nombreUnites ?? undefined,
      prix_nuit_unite: sim?.prixNuitUnite ?? undefined,
      niveau_confort: unwrapSelect(sim?.niveauConfort),
      equipements_chambre: sim?.equipementsChambre ?? undefined,
      description_immersive: sim?.descriptionImmersive ?? undefined,
      galerie: transformAcfMediaConnection(sim?.galerie ?? existing?.photos),
      coordonnees_plan: sim?.coordonneesPlan
        ? { x: sim.coordonneesPlan.x, y: sim.coordonneesPlan.y }
        : undefined,
      zone_plan_svg_id: sim?.zonePlanSvgId ?? undefined,
    },
  }
}

// --- Espace de travail (simulateur) ---
// Merges existing "espacesDeTravail" field group + new "espaceSimulateur" field group

export function transformEspaceSim(gqlPost: any): SimEspace {
  const existing = gqlPost.espacesDeTravail
  const sim = gqlPost.espaceSimulateur

  return {
    slug: gqlPost.slug,
    title: gqlPost.title || "",
    featuredImage: transformAcfMediaEdge(gqlPost.featuredImage),
    acf: {
      nom: existing?.nom || gqlPost.title || "",
      descriptif: transformContentLinks(existing?.descriptif || ""),
      capacite_max: sim?.capaciteMax ?? undefined,
      superficie_m2: sim?.superficieM2 ?? undefined,
      privatisable: sim?.privatisable ?? undefined,
      prix_privatisation_journee: sim?.prixPrivatisationJournee ?? undefined,
      equipements: sim?.equipements ?? undefined,
      ambiance: unwrapSelect(sim?.ambiance),
      description_immersive: sim?.descriptionImmersive ?? undefined,
      galerie: transformAcfMediaConnection(sim?.galerie ?? existing?.photos),
      vue_360_url: sim?.vue360Url ?? undefined,
      coordonnees_plan: sim?.coordonneesPlan
        ? { x: sim.coordonneesPlan.x, y: sim.coordonneesPlan.y }
        : undefined,
      zone_plan_svg_id: sim?.zonePlanSvgId ?? undefined,
    },
  }
}

// --- Service (simulateur) ---
// Reads "serviceSimulateur" field group (new CPT usage)

export function transformServiceSim(gqlPost: any): SimService {
  const sim = gqlPost.serviceSimulateur

  const categories = gqlPost.serviceCategories?.nodes?.map((c: any) => ({
    slug: c.slug,
    name: c.name,
  }))

  return {
    slug: gqlPost.slug,
    title: gqlPost.title || "",
    featuredImage: transformAcfMediaEdge(gqlPost.featuredImage),
    acf: {
      nom: sim?.nom || gqlPost.title || "",
      descriptif: transformContentLinks(sim?.descriptif || ""),
      prix_par_personne: sim?.prixParPersonne ?? undefined,
      prix_forfaitaire: sim?.prixForfaitaire ?? undefined,
      mode_tarification: unwrapSelect(sim?.modeTarification),
      inclus_par_defaut: sim?.inclusParDefaut ?? undefined,
      creneaux_disponibles: sim?.creneauxDisponibles ?? undefined,
      description_courte: sim?.descriptionCourte ?? undefined,
      description_immersive: sim?.descriptionImmersive ?? undefined,
      galerie: transformAcfMediaConnection(sim?.galerie),
      options:
        sim?.options?.map((opt: any) => ({
          nom: opt.nom || "",
          supplement_par_personne: opt.supplementParPersonne ?? 0,
        })) ?? undefined,
    },
    categories: categories?.length ? categories : undefined,
  }
}

// --- Template de séjour ---
// Reads "sejourTemplateFields" field group + sejourCategories taxonomy

export function transformSejourTemplate(gqlPost: any): SimSejourTemplate {
  const fields = gqlPost.sejourTemplateFields
  const categoryNode = gqlPost.sejourCategories?.nodes?.[0]

  return {
    slug: gqlPost.slug,
    title: gqlPost.title || "",
    featuredImage: transformAcfMediaEdge(gqlPost.featuredImage),
    acf: {
      duree_jours: fields?.dureeJours ?? undefined,
      description_promesse: fields?.descriptionPromesse ?? undefined,
      image_hero: transformAcfMediaEdge(fields?.imageHero),
      programme_defaut: fields?.programmeDefaut?.map(transformProgrammeJour) ?? undefined,
    },
    category: (categoryNode?.slug as SejourCategory) ?? undefined,
  }
}

function transformProgrammeJour(gqlJour: any): ProgrammeJour {
  return {
    jour_numero: gqlJour.jourNumero ?? 1,
    creneaux: gqlJour.creneaux?.map(transformProgrammeCreneau) ?? [],
  }
}

function transformProgrammeCreneau(gqlCreneau: any): ProgrammeCreneau {
  const creneau: ProgrammeCreneau = {
    creneau: unwrapSelect(gqlCreneau.creneau) || "matin",
  }

  // Relationship fields come as AcfContentNodeConnection { nodes: [...] }
  const activiteNode = gqlCreneau.activiteSuggeree?.nodes?.[0]
  if (activiteNode) {
    creneau.activite_suggeree = {
      slug: activiteNode.slug,
      title: activiteNode.title || "",
    }
  }

  const espaceNode = gqlCreneau.espaceSuggere?.nodes?.[0]
  if (espaceNode) {
    creneau.espace_suggere = {
      slug: espaceNode.slug,
      title: espaceNode.title || "",
    }
  }

  const serviceNode = gqlCreneau.serviceSuggere?.nodes?.[0]
  if (serviceNode) {
    creneau.service_suggere = {
      slug: serviceNode.slug,
      title: serviceNode.title || "",
    }
  }

  if (gqlCreneau.labelPersonnalise) {
    creneau.label_personnalise = gqlCreneau.labelPersonnalise
  }

  return creneau
}

// --- Paramètres globaux du simulateur ---

export function transformSimulateurSettings(raw: any): SimulateurSettings {
  return {
    nom_lieu: raw.nomLieu || "L'Hermitage",
    description_lieu: raw.descriptionLieu ?? undefined,
    plan_domaine_svg_url: raw.planDomaineSvgUrl ?? undefined,
    capacite_totale_max: raw.capaciteTotaleMax ?? 200,
    prix_base_journee_personne: raw.prixBaseJourneePersonne ?? 95,
    coefficient_weekend: raw.coefficientWeekend ?? 1.15,
    coefficient_haute_saison: raw.coefficientHauteSaison ?? 1.25,
    periodes_haute_saison:
      raw.periodesHauteSaison?.map((p: any) => ({
        date_debut: p.dateDebut || "",
        date_fin: p.dateFin || "",
      })) ?? undefined,
    email_commercial: raw.emailCommercial ?? undefined,
    telephone_commercial: raw.telephoneCommercial ?? undefined,
    equipements_disponibles:
      raw.equipementsDisponibles?.map((e: any) => ({
        slug: e.slug || "",
        label: e.label || "",
      })) ?? undefined,
    ambiances_disponibles:
      raw.ambiancesDisponibles?.map((a: any) => ({
        slug: a.slug || "",
        label: a.label || "",
      })) ?? undefined,
  }
}
