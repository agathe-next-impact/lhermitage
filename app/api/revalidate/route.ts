import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * On-demand revalidation endpoint for WordPress webhooks.
 *
 * WordPress should send a POST request when content is published/updated:
 *   POST /api/revalidate
 *   Headers: { "x-revalidation-secret": "<REVALIDATION_SECRET>" }
 *   Body: { "post_type": "hebergement", "slug": "ma-chambre" }
 *
 * If no slug is provided, the listing page for that post type is revalidated.
 * If no post_type is provided, the entire site is revalidated.
 */

const POST_TYPE_PATHS: Record<string, { listing: string; detail: string }> = {
  hebergement: { listing: "/hebergements", detail: "/hebergement" },
  activite: { listing: "/sejours-collectifs/activites", detail: "/activite" },
  sejour: { listing: "/sejours-collectifs/packs-de-sejours", detail: "/sejour" },
  structure: { listing: "/ecosysteme-innovant/structures", detail: "/structure" },
  evenement: { listing: "/ecosysteme-innovant/evenements", detail: "" },
  partenaire: { listing: "/ecosysteme-innovant/partenaires", detail: "" },
  "espace-de-travail": { listing: "/services", detail: "" },
  page: { listing: "", detail: "" },
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidation-secret")

  if (!process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: "REVALIDATION_SECRET not configured on server" },
      { status: 500 }
    )
  }

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { post_type, slug } = body as { post_type?: string; slug?: string }

    const revalidated: string[] = []

    // Always revalidate homepage (it aggregates content from multiple types)
    revalidatePath("/")
    revalidated.push("/")

    if (!post_type) {
      // No post_type: revalidate all known listing pages
      for (const paths of Object.values(POST_TYPE_PATHS)) {
        if (paths.listing) {
          revalidatePath(paths.listing)
          revalidated.push(paths.listing)
        }
      }
    } else if (post_type === "page") {
      // WordPress page: revalidate by slug path
      if (slug) {
        revalidatePath(`/${slug}`)
        revalidated.push(`/${slug}`)
      }
    } else {
      const paths = POST_TYPE_PATHS[post_type]

      if (paths) {
        // Revalidate listing page
        if (paths.listing) {
          revalidatePath(paths.listing)
          revalidated.push(paths.listing)
        }

        // Revalidate detail page if slug provided
        if (slug && paths.detail) {
          revalidatePath(`${paths.detail}/${slug}`)
          revalidated.push(`${paths.detail}/${slug}`)
        }
      }
    }

    return NextResponse.json({
      revalidated,
      now: Date.now(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
