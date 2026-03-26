import { gql } from "graphql-request"
import { PAGE_FIELDS } from "../fragments"

export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFields
    }
  }
  ${PAGE_FIELDS}
`

export const GET_PAGE_BY_ID = gql`
  query GetPageById($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      ...PageFields
    }
  }
  ${PAGE_FIELDS}
`

export const GET_ALL_PAGES = gql`
  query GetAllPages($first: Int!, $after: String) {
    pages(first: $first, after: $after, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PageFields
      }
    }
  }
  ${PAGE_FIELDS}
`

// Separate query for tiers-lieu innovation page video — isolated so it can fail
// gracefully without breaking the main page query if the ACF field group is not
// yet configured in WordPress.
export const GET_PAGE_VIDEO_DENTETE = gql`
  query GetPageVideoDentete($slug: ID!) {
    page(id: $slug, idType: URI) {
      pageTiersLieuDInnovation {
        videoDentete {
          node {
            mediaItemUrl
            mimeType
          }
        }
        descriptif
      }
    }
  }
`

// Lightweight query for generateStaticParams — only fetches link, no ACF fields
export const GET_ALL_PAGE_PATHS = gql`
  query GetAllPagePaths($first: Int!, $after: String) {
    pages(first: $first, after: $after, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        databaseId
        slug
        link
        status
      }
    }
  }
`
