import { gql } from "graphql-request"

// For type-de-partenaire taxonomy
export const GET_TYPES_DE_PARTENAIRE = gql`
  query GetTypesDePartenaire {
    typesDePartenaire(first: 100, where: { hideEmpty: true }) {
      nodes {
        databaseId
        name
        slug
        count
        description
        link
      }
    }
  }
`

// For categorie-activite taxonomy (if exists)
export const GET_CATEGORIES_ACTIVITE = gql`
  query GetCategoriesActivite {
    categoriesActivite(first: 100, where: { hideEmpty: true }) {
      nodes {
        databaseId
        name
        slug
        count
        description
        link
      }
    }
  }
`

// Generic taxonomy query - fallback pattern
// Note: WPGraphQL doesn't have a generic "terms" query.
// Each taxonomy has its own root query field.
// This is here as documentation; actual usage will use specific taxonomy queries above.
