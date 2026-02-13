import { GraphQLClient } from "graphql-request"
import { decodeObjectEntities } from "../decode"
import { logger } from "../../logger"

function getGraphQLUrl(): string {
  const url = process.env.WP_GRAPHQL_URL
  if (!url) throw new Error("WP_GRAPHQL_URL environment variable is required")
  return url
}

const GRAPHQL_URL = getGraphQLUrl()

function createClient(revalidate: number = 900): GraphQLClient {
  return new GraphQLClient(GRAPHQL_URL, {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Next.js WordPress GraphQL Client",
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      return fetch(input, {
        ...init,
        signal: controller.signal,
        next: { revalidate },
      } as RequestInit).finally(() => clearTimeout(timeoutId))
    },
  })
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number; retries?: number }
): Promise<T> {
  const { revalidate = 900, retries = 2 } = options || {}
  const client = createClient(revalidate)

  try {
    const data = await client.request<T>(query, variables)
    return decodeObjectEntities(data)
  } catch (error) {
    if (retries > 0) {
      const isServerError =
        error instanceof Error &&
        (error.message.includes("5") || error.name === "AbortError" || error.message.includes("fetch"))

      if (isServerError) {
        const delay = Math.pow(2, 3 - retries) * 1000
        await new Promise((r) => setTimeout(r, delay))
        return gqlRequest<T>(query, variables, {
          revalidate,
          retries: retries - 1,
        })
      }
    }

    logger.error("GraphQL request failed:", error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Safe wrapper for list queries — returns empty array on error
 */
export async function gqlRequestList<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number }
): Promise<T> {
  try {
    return await gqlRequest<T>(query, variables, options)
  } catch (error) {
    logger.error("GraphQL list request failed:", error instanceof Error ? error.message : error)
    return {} as T
  }
}
