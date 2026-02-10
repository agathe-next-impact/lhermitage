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
    pages(
      first: $first
      after: $after
      where: { orderby: { field: MENU_ORDER, order: ASC } }
    ) {
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
