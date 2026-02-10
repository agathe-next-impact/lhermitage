import { gql } from "graphql-request"
import { IMAGE_FIELDS } from "../fragments"

// WPGraphQL root query: sJours (accent mangling from "séjour")
// ACF field group: "sejours" (main content)
// NOTE: Requires WordPress admin fix — graphql_field_name changed from "séJours" to "sejours"

export const GET_SEJOURS = gql`
  query GetSejours {
    sJours(first: 100) {
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
        sejours {
          nom
          descriptif
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`

export const GET_SEJOUR_BY_SLUG = gql`
  query GetSejourBySlug($slug: ID!) {
    sJour(id: $slug, idType: SLUG) {
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
      sejours {
        nom
        descriptif
      }
    }
  }
  ${IMAGE_FIELDS}
`
