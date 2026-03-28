import { gql } from "graphql-request"
import { IMAGE_FIELDS } from "../fragments"

export const GET_MENU = gql`
  query GetMenu($slug: ID!) {
    menu(id: $slug, idType: SLUG) {
      menuItems(first: 100) {
        nodes {
          databaseId
          label
          url
          parentDatabaseId
          order
          connectedNode {
            node {
              ... on Page {
                databaseId
                slug
                uri
              }
              ... on Post {
                databaseId
                slug
                uri
              }
            }
          }
        }
      }
    }
  }
`

export const GET_GLOBAL_OPTIONS = gql`
  query GetGlobalOptions {
    optionsGlobales {
      menu {
        lienDuCtaDeBarreSuperieure {
          url
          title
          target
        }
        miniatureDuMegamenu {
          titreCta1
          lienCta1 {
            url
            title
            target
          }
          titreCta2
          lienCta2 {
            url
            title
            target
          }
          image {
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
