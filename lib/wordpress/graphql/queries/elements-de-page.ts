import { gql } from "graphql-request"
import { IMAGE_FIELDS } from "../fragments"

/**
 * Isolated query for the legacy "Elements de page" ACF field group.
 *
 * This field group exposes a `hero { sous-titre, image }` subgroup that
 * is intended to drive the bento PageHeader on every page of the site.
 *
 * Mirrors the patrimoine / nous-soutenir pattern: kept out of PAGE_FIELDS
 * so the central `getPageById()` query keeps working **even when the
 * field group is not yet exposed on the GraphQL `Page` type**.
 *
 * Required WP admin step (one-shot, on the « Elements de page » ACF
 * field group): set
 *   - `show_in_graphql: 1`
 *   - `graphql_field_name: elementsDePage`
 *   - `map_graphql_types_from_location_rules: 1`
 *      (or alternatively `graphql_types: ["Page"]`)
 *
 * Until that flag is on, this query throws `Cannot query field
 * "elementsDePage" on type "Page"` — `wpApi.getElementsDePageHero()`
 * catches that error and returns `null`, so all pages keep rendering
 * with their WP-native fallbacks.
 */
export const GET_PAGE_ELEMENTS_DE_PAGE = gql`
  query GetPageElementsDePage($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      elementsDePage {
        hero {
          titre
          sousTitre
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
