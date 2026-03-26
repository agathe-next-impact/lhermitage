import { gql } from "graphql-request"
import { IMAGE_FIELDS } from "../fragments"

// --- Hébergements ---
// WPGraphQL root query: hBergements (accent mangling from "hébergement")
// ACF field groups: "hebergements" (nom, descriptif, photos, video) + "mapPinPoints" (map visibility)
// Note: "localisation" field does NOT exist on Hebergements ACF type in GraphQL

export const GET_HEBERGEMENTS = gql`
  query GetHebergements {
    hBergements(first: 100) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        hebergements {
          nom
          descriptif
          disponibilite
          capaciteDaccueil
          repartitionDesChambres
          commodites
          photos {
            nodes {
              ...ImageFields
            }
          }
          video
        }
        mapPinPoints {
          nomPin: nom
          descriptif
          visibilite
          position {
            latitude
            longitude
            altitude
          }
          images {
            nodes {
              ...ImageFields
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

export const GET_HEBERGEMENT_BY_SLUG = gql`
  query GetHebergementBySlug($slug: ID!) {
    hBergement(id: $slug, idType: SLUG) {
      databaseId
      slug
      title
      date
      status
      link
      featuredImage {
        node {
          ...ImageFields
        }
      }
      hebergements {
        nom
        descriptif
        disponibilite
        capaciteDaccueil
        repartitionDesChambres
        commodites
        photos {
          nodes {
            ...ImageFields
          }
        }
        video
      }
      mapPinPoints {
        nomPin: nom
        descriptif
        visibilite
        position {
          latitude
          longitude
          altitude
        }
        images {
          nodes {
            ...ImageFields
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Activités ---
// WPGraphQL root query: activitS (accent mangling from "activité")
// ACF field group: "activites" (main content)
// NOTE: Requires WordPress admin fix — graphql_field_name changed from "activitéS" to "activites"

export const GET_ACTIVITES = gql`
  query GetActivites {
    activitS(first: 100) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        typesDactivites {
          nodes {
            databaseId
            name
            slug
            displayOrder
          }
        }
        activites {
          nom
          descriptif
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

export const GET_ACTIVITE_BY_SLUG = gql`
  query GetActiviteBySlug($slug: ID!) {
    activit(id: $slug, idType: SLUG) {
      databaseId
      slug
      title
      date
      status
      link
      featuredImage {
        node {
          ...ImageFields
        }
      }
      typesDactivites {
        nodes {
          databaseId
          name
          slug
          displayOrder
        }
      }
      activites {
        nom
        descriptif
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Structures ---
// ACF: Two field groups - "structures" (main content) + "mapPinPoints" (map visibility)

export const GET_STRUCTURES = gql`
  query GetStructures {
    structures(first: 100) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        structures {
          nom
          typeDeStructure
          descriptif
          photos {
            nodes {
              ...ImageFields
            }
          }
          lien {
            url
            title
            target
          }
          video
          localisation {
            latitude
            longitude
            zoom
            streetAddress
          }
        }
        mapPinPoints {
          nomPin: nom
          descriptif
          visibilite
          position {
            latitude
            longitude
            altitude
          }
          images {
            nodes {
              ...ImageFields
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

export const GET_STRUCTURE_BY_SLUG = gql`
  query GetStructureBySlug($slug: ID!) {
    structure(id: $slug, idType: SLUG) {
      databaseId
      slug
      title
      date
      status
      link
      featuredImage {
        node {
          ...ImageFields
        }
      }
      structures {
        nom
        typeDeStructure
        descriptif
        photos {
          nodes {
            ...ImageFields
          }
        }
        lien {
          url
          title
          target
        }
        video
        localisation {
          latitude
          longitude
          zoom
          streetAddress
        }
      }
      mapPinPoints {
        nomPin: nom
        descriptif
        visibilite
        position {
          latitude
          longitude
          altitude
        }
        images {
          nodes {
            ...ImageFields
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Événements ---
// WPGraphQL root query: evNements (accent mangling from "événement")
// ACF field group: "evenements" (main content)
// NOTE: Requires WordPress admin fix — graphql_field_name changed from "evéNements" to "evenements"

export const GET_EVENEMENTS = gql`
  query GetEvenements {
    evenements(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        categoriesEvenement {
          nodes {
            databaseId
            name
            slug
          }
        }
        evenementFields {
          eventdatestart
          eventDateEnd
          eventDateLabel
          eventPitch
          eventVenue
          eventVenueLabel
          eventAddress
          eventZip
          eventCity
          eventAccessType
          eventCapacityLimited
          eventCapacityTotal
          eventBookingRequired
          eventBookingType
          eventBookingCtaLabel
          eventFoodAvailable
          eventFoodDescription
          eventFoodLocal
          eventContactPhone
          eventContactEmail
          eventIcon
          eventColorAccent
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Partenaires ---
// ACF field group name: "partenaires" (plural)

export const GET_PARTENAIRES = gql`
  query GetPartenaires {
    partenaires(first: 100) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        typesDePartenaire {
          nodes {
            databaseId
            name
            slug
          }
        }
        partenaires {
          nom
          descriptif
          lien {
            url
            title
            target
          }
          logo {
            node {
              ...ImageFields
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Espaces de travail ---
// ACF: Two field groups - "espacesDeTravail" (main) + "mapPinPoints" (map)

export const GET_ESPACES_DE_TRAVAIL = gql`
  query GetEspacesDeTravail {
    espacesDeTravail(first: 100) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
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
        mapPinPoints {
          nomPin: nom
          descriptif
          visibilite
          position {
            latitude
            longitude
            altitude
          }
          images {
            nodes {
              ...ImageFields
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Services ---
// WPGraphQL root query: services
// ACF field group: "pageServices" (nom, descriptif, photos)
// Taxonomy: typesDeServices (with displayOrder + image term meta)

export const GET_SERVICES = gql`
  query GetServices {
    services(first: 100) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        typesDeServices {
          nodes {
            databaseId
            name
            slug
            displayOrder
            image {
              ...ImageFields
            }
          }
        }
        pageServices {
          nom
          descriptif
          photos {
            nodes {
              ...ImageFields
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

// --- Team Members ---
// WPGraphQL root query: equipes (custom name for "membre" CPT)
// ACF field group: "membreDEquipe" (member content)
// NOTE: Requires WordPress admin fix — graphql_field_name changed from "membreD'Equipe" to "membreDEquipe"

export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers {
    equipes(first: 100, where: { orderby: { field: DATE, order: ASC } }) {
      nodes {
        databaseId
        slug
        title
        date
        status
        link
        featuredImage {
          node {
            ...ImageFields
          }
        }
        membreDEquipe {
          binomeSeul
          descriptif
          photo {
            node {
              ...ImageFields
            }
          }
          activitePrincipale
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`
