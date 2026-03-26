import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware that detects WordPress old-slug redirects.
 *
 * When a slug is changed in WordPress, WP stores the old slug in `_wp_old_slug`
 * postmeta and issues a 301 redirect on its frontend. This middleware leverages
 * that built-in mechanism by making a lightweight HEAD request to the WP frontend.
 *
 * Results are cached in-memory (per Edge instance) for 1 hour to avoid
 * hitting WordPress on every request.
 */

const WP_ORIGIN = (() => {
  try {
    return new URL(
      process.env.WP_GRAPHQL_URL || "https://admin.hermitagelelab.com/graphql"
    ).origin
  } catch {
    return "https://admin.hermitagelelab.com"
  }
})()

// In-memory redirect cache (per Edge instance, reset on each deployment)
const redirectCache = new Map<string, { target: string | null; ts: number }>()
const CACHE_TTL = 3_600_000 // 1 hour

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Serve from cache if available
  const cached = redirectCache.get(pathname)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    if (cached.target) {
      const url = request.nextUrl.clone()
      url.pathname = cached.target
      return NextResponse.redirect(url, 301)
    }
    return NextResponse.next()
  }

  // Ask WordPress if this path triggers an old-slug redirect.
  // Use trailing slash to match WP permalink structure and avoid
  // a spurious trailing-slash-normalization redirect.
  try {
    const wpPath = pathname.endsWith("/") ? pathname : `${pathname}/`
    const res = await fetch(`${WP_ORIGIN}${wpPath}`, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(3000),
    })

    if ((res.status === 301 || res.status === 302) && res.headers.has("location")) {
      const location = res.headers.get("location")!
      try {
        const target = new URL(location)
        // Only follow redirects on the same WP domain (skip protocol/www normalization)
        if (target.origin === WP_ORIGIN) {
          const newPath = target.pathname.replace(/\/+$/, "") || "/"
          if (newPath !== pathname) {
            redirectCache.set(pathname, { target: newPath, ts: Date.now() })
            const url = request.nextUrl.clone()
            url.pathname = newPath
            return NextResponse.redirect(url, 301)
          }
        }
      } catch {
        /* malformed location header — ignore */
      }
    }

    // No redirect — cache negative result
    redirectCache.set(pathname, { target: null, ts: Date.now() })
  } catch {
    // WP unreachable or timeout — don't cache, don't block
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals, API routes, and static files (anything with a dot extension)
    "/((?!_next|api|favicon\\.ico|.*\\..*).*)",
  ],
}
