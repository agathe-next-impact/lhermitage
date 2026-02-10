import { gql } from "graphql-request"

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
        }
      }
    }
  }
`

// OptionsGlobales ACF Options Page
// NOTE: The "menu" field group is not yet properly attached.
// The optionsGlobales root query exists but the inner ACF field groups
// (OptionsGlobalesMenu, OptionsGlobalesMenuMiniatureDuMegamenu) aren't
// accessible yet. Fallback values are used in api.ts.
