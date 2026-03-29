import { GraphQLClient } from "graphql-request"
import { decodeObjectEntities } from "../decode"
import { logger } from "../../logger"

const GRAPHQL_URL =
  process.env.WP_GRAPHQL_URL || "https://admin.hermitagelelab.com/graphql"

const REQUEST_TIMEOUT = 30_000

/**
 * Concurrency limiter — prevents overwhelming WordPress during build.
 * Next.js generates all static pages in parallel, sending hundreds of
 * simultaneous GraphQL requests. WordPress (shared hosting) cannot handle
 * this and starts dropping connections, causing cascading failures.
 */
const MAX_CONCURRENT = 6
let active = 0
const queue: Array<() => void> = []

function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++
    return Promise.resolve()
  }
  return new Promise((resolve) => queue.push(resolve))
}

function releaseSlot(): void {
  const next = queue.shift()
  if (next) {
    next()
  } else {
    active--
  }
}

function createClient(revalidate: number = 900): GraphQLClient {
  return new GraphQLClient(GRAPHQL_URL, {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Next.js WordPress GraphQL Client",
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
      return fetch(input, {
        ...init,
        signal: controller.signal,
        next: { revalidate },
      } as RequestInit).finally(() => clearTimeout(timeoutId))
    },
  })
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.name === "AbortError" ||
    error.message.includes("fetch") ||
    error.message.includes("ECONNRESET") ||
    error.message.includes("ETIMEDOUT") ||
    error.message.includes("socket") ||
    /\b5\d{2}\b/.test(error.message)
  )
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number; retries?: number }
): Promise<T> {
  const { revalidate = 900, retries = 3 } = options || {}
  const client = createClient(revalidate)

  await acquireSlot()
  let released = false
  try {
    const data = await client.request<T>(query, variables)
    return decodeObjectEntities(data)
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      const delay = Math.pow(2, 4 - retries) * 1000
      logger.warn(`GraphQL request failed, retrying in ${delay}ms (${retries} left):`, error instanceof Error ? error.message : error)
      // Free slot during backoff so other requests can proceed
      releaseSlot()
      released = true
      await new Promise((r) => setTimeout(r, delay))
      return gqlRequest<T>(query, variables, {
        revalidate,
        retries: retries - 1,
      })
    }

    logger.error("GraphQL request failed:", error instanceof Error ? error.message : error)
    throw error
  } finally {
    if (!released) releaseSlot()
  }
}

/**
 * Safe wrapper for list queries — returns empty object on error.
 * Always logs full error details (even in production) to diagnose build failures.
 */
export async function gqlRequestList<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number }
): Promise<T> {
  try {
    return await gqlRequest<T>(query, variables, options)
  } catch (error) {
    // Always log full error in production — silent failures here cause empty pages
    console.error(
      "[GraphQL] List request failed — returning empty result.",
      "Query:", query.slice(0, 80).replace(/\s+/g, " "),
      "Error:", error instanceof Error ? error.message : error
    )
    return {} as T
  }
}
