import { gql } from "graphql-request"
import { IMAGE_FIELDS, FEATURED_IMAGE_FRAGMENT } from "../fragments"

/**
 * Separate query for pageSeminaires ACF fields.
 * Isolated from PAGE_FIELDS so the main page queries don't break
 * if the ACF field group hasn't been imported into WordPress yet.
 */
export const GET_PAGE_SEMINAIRES = gql`
  query GetPageSeminaires($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      pageSeminaires {
        heroSeminaires {
          video {
            node {
              mediaItemUrl
              mimeType
            }
          }
          image {
            node {
              ...ImageFields
            }
          }
          accroche
          sousTitre
          ctaTexte
          ctaLien {
            url
            title
            target
          }
        }
        promesse {
          titre
          storytelling
          image {
            node {
              ...ImageFields
            }
          }
          chiffresCles {
            valeur
            unite
            label
          }
        }
        espacesTravail {
          titre
          introduction
          espaces {
            nodes {
              databaseId
              slug
              ... on EspaceDeTravail {
                title
                featuredImage {
                  ...FeaturedImageFields
                }
                espacesDeTravail {
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
          facilitation {
            titre
            contenu
            badge
          }
        }
        activitesTeambuilding {
          titre
          sousTitre
          activites {
            nodes {
              databaseId
              slug
              ... on Activit__ {
                title
                featuredImage {
                  ...FeaturedImageFields
                }
                activites {
                  nom
                  descriptif
                }
              }
            }
          }
        }
        restauration {
          services {
            nodes {
              databaseId
              slug
              ... on Service {
                title
                featuredImage {
                  ...FeaturedImageFields
                }
              }
            }
          }
        }
        hebergementsSeminaires {
          titre
          sousTitre
          hebergements {
            nodes {
              databaseId
              slug
              ... on H__bergement {
                title
                featuredImage {
                  ...FeaturedImageFields
                }
                hebergements {
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
        }
        temoignages {
          titre
          citations {
            citation
            auteur
            role
          }
          logos(first: 100) {
            nodes {
              ...ImageFields
            }
          }
        }
        contact {
          titre
          conciergerie
          nomContact
          email
          telephone
          photo {
            node {
              ...ImageFields
            }
          }
          ctaTexte
          ctaLien {
            url
            title
            target
          }
        }
      }
    }
  }
  ${FEATURED_IMAGE_FRAGMENT}
`
