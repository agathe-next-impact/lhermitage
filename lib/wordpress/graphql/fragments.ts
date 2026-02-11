import { gql } from "graphql-request"

export const IMAGE_FIELDS = gql`
  fragment ImageFields on MediaItem {
    databaseId
    sourceUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
`

export const FEATURED_IMAGE_FRAGMENT = gql`
  fragment FeaturedImageFields on NodeWithFeaturedImageToMediaItemConnectionEdge {
    node {
      ...ImageFields
    }
  }
  ${IMAGE_FIELDS}
`

// TODO: After WordPress admin ACF configuration, add these ACF field groups to PageFields:
//   elementsDePageHero { sousTitre, image { node { ...ImageFields } } }
// Requires: graphql_field_name fix (remove accents) + map_graphql_types_from_location_rules: 1
// WARNING: Adding fields that don't exist in the schema will break ALL page queries.
export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    databaseId
    slug
    title
    content
    date
    status
    link
    parentDatabaseId
    menuOrder
    featuredImage {
      ...FeaturedImageFields
    }
    pageDAccueil {
      slogan
      video
    }
    pageHistorique {
      timeline {
        titre
        annee
        descriptif
        image {
          node {
            ...ImageFields
          }
        }
      }
    }
    pageDevenirSocietaire {
      chapeau
      bandeau {
        titre
        cta {
          url
          title
          target
        }
        images {
          nodes {
            ...ImageFields
          }
        }
      }
      pourquoiRejoindre {
        titre
        raisons {
          raison
        }
      }
      ceQuestDevenirSocietaire {
        titre
        motivation1
        motivation2
        motivation3
        motivation4
      }
      questCeQueLaScic {
        titre
        caracteristiquesDeLaScic {
          caracteristique {
            titre
            descriptif
          }
        }
      }
      informationsSocietariat {
        titre
        descriptif
      }
    }
  }
  ${FEATURED_IMAGE_FRAGMENT}
`

export const MENU_ITEM_FIELDS = gql`
  fragment MenuItemFields on MenuItem {
    databaseId
    label
    url
    parentDatabaseId
    order
  }
`
