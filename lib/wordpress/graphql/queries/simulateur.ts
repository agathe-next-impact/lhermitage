import { gql } from "graphql-request"
import { IMAGE_FIELDS } from "../fragments"

// --- Activités (simulateur) ---
// WPGraphQL root query: activitS (accent mangling from "activité")
// ACF field groups: "activites" (existing main) + "activiteSimulateur" (new simulator fields)
// Taxonomy: activiteTypes

export const GET_ACTIVITES_SIMULATEUR = gql`
  query GetActivitesSimulateur {
    activitS(first: 100) {
      nodes {
        databaseId
        slug
        title
        featuredImage {
          node {
            ...ImageFields
          }
        }
        activiteTypes {
          nodes {
            databaseId
            name
            slug
          }
        }
        activites {
          nom
          descriptif
        }
        activiteSimulateur {
          dureeMinutes
          capaciteMin
          capaciteMax
          prixParPersonne
          prixForfaitaire
          modeTarification
          creneauSuggere
          creneauxDisponibles
          descriptionImmersive
          galerie {
            nodes {
              ...ImageFields
            }
          }
          videoTeaserUrl
          niveauPhysique
          interieurExterieur
          coordonneesPlan {
            x
            y
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Hébergements (simulateur) ---
// WPGraphQL root query: hBergements (accent mangling from "hébergement")
// ACF field groups: "hebergements" (existing main) + "hebergementSimulateur" (new simulator fields)

export const GET_HEBERGEMENTS_SIMULATEUR = gql`
  query GetHebergementsSimulateur {
    hBergements(first: 100) {
      nodes {
        databaseId
        slug
        title
        featuredImage {
          node {
            ...ImageFields
          }
        }
        hebergements {
          nom
          descriptif
          photos {
            nodes {
              ...ImageFields
            }
          }
          video
        }
        hebergementSimulateur {
          capacitePersonnes
          nombreUnites
          prixNuitUnite
          niveauConfort
          equipementsChambre
          descriptionImmersive
          galerie {
            nodes {
              ...ImageFields
            }
          }
          coordonneesPlan {
            x
            y
          }
          zonePlanSvgId
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Espaces de travail (simulateur) ---
// WPGraphQL root query: espacesDeTravail
// ACF field groups: "espacesDeTravail" (existing main) + "espaceSimulateur" (new simulator fields)

export const GET_ESPACES_SIMULATEUR = gql`
  query GetEspacesSimulateur {
    espacesDeTravail(first: 100) {
      nodes {
        databaseId
        slug
        title
        featuredImage {
          node {
            ...ImageFields
          }
        }
        espacesDeTravail {
          nom
          descriptif
          photos {
            nodes {
              ...ImageFields
            }
          }
          video
        }
        espaceSimulateur {
          capaciteMax
          superficieM2
          privatisable
          prixPrivatisationJournee
          equipements
          ambiance
          descriptionImmersive
          galerie {
            nodes {
              ...ImageFields
            }
          }
          vue360Url
          coordonneesPlan {
            x
            y
          }
          zonePlanSvgId
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Services (simulateur) ---
// WPGraphQL root query: services (existing CPT, was unused)
// ACF field group: "serviceSimulateur" (new simulator fields)
// Taxonomy: serviceCategories

export const GET_SERVICES_SIMULATEUR = gql`
  query GetServicesSimulateur {
    services(first: 100) {
      nodes {
        databaseId
        slug
        title
        featuredImage {
          node {
            ...ImageFields
          }
        }
        serviceCategories {
          nodes {
            databaseId
            name
            slug
          }
        }
        serviceSimulateur {
          prixParPersonne
          prixForfaitaire
          modeTarification
          inclusParDefaut
          creneauxDisponibles
          descriptionCourte
          descriptionImmersive
          galerie {
            nodes {
              ...ImageFields
            }
          }
          options {
            nom
            supplementParPersonne
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Templates de séjour ---
// WPGraphQL root query: sejourTemplates (new CPT)
// ACF field group: "sejourTemplateFields"
// Taxonomy: sejourCategories
// Relationship fields use union types for activite_suggeree / espace_suggere

export const GET_SEJOUR_TEMPLATES = gql`
  query GetSejourTemplates {
    sejourTemplates(first: 100) {
      nodes {
        databaseId
        slug
        title
        featuredImage {
          node {
            ...ImageFields
          }
        }
        sejourCategories {
          nodes {
            databaseId
            name
            slug
          }
        }
        sejourTemplateFields {
          dureeJours
          descriptionPromesse
          imageHero {
            node {
              ...ImageFields
            }
          }
          programmeDefaut {
            jourNumero
            creneaux {
              creneau
              activiteSuggeree {
                nodes {
                  ... on Activit__ {
                    databaseId
                    slug
                    title
                  }
                }
              }
              espaceSuggere {
                nodes {
                  ... on EspaceDeTravail {
                    databaseId
                    slug
                    title
                  }
                }
              }
              serviceSuggere {
                nodes {
                  ... on Service {
                    databaseId
                    slug
                    title
                  }
                }
              }
              labelPersonnalise
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Paramètres globaux du simulateur ---
// ACF Options page: acfOptionsSimulateurSettings

export const GET_SIMULATEUR_SETTINGS = gql`
  query GetSimulateurSettings {
    simulateurSettings {
      simulateurSettings {
        nomLieu
        descriptionLieu
        planDomaineSvgUrl
        capaciteTotaleMax
        prixBaseJourneePersonne
        coefficientWeekend
        coefficientHauteSaison
        periodesHauteSaison {
          dateDebut
          dateFin
        }
        emailCommercial
        telephoneCommercial
        equipementsDisponibles {
          slug
          label
        }
        ambiancesDisponibles {
          slug
          label
        }
      }
    }
  }
`
