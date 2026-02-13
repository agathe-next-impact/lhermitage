import { notFound } from "next/navigation"
import { cache } from "react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { wpApi } from "@/lib/wordpress/api"
import { stripHtml } from "@/lib/utils"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { REVALIDATION } from "@/lib/constants"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export const revalidate = REVALIDATION.detail

const getActivite = cache((slug: string) =>
  wpApi.getActiviteBySlug(slug)
)

interface ActivitePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ActivitePageProps): Promise<Metadata> {
  const { slug } = await params
  const activite = await getActivite(slug)

  if (!activite) {
    return { title: "Activité non trouvée" }
  }

  const title = activite.acf?.nom || activite.title?.rendered || "Activité"
  const description = activite.acf?.descriptif
    ? stripHtml(activite.acf.descriptif).substring(0, 160)
    : "Découvrez cette activité à L'Hermitage"
  const image = activite._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    || "/diverse-outdoor-activities.png"

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export async function generateStaticParams() {
  const activites = await wpApi.getActivites()
  return activites.map((activite) => ({
    slug: activite.slug,
  }))
}

export default async function ActivitePage({ params }: ActivitePageProps) {
  const { slug } = await params
  const activite = await getActivite(slug)

  if (!activite) {
    notFound()
  }

  const title = activite.acf?.nom || activite.title?.rendered || "Activité"
  const description = activite.acf?.descriptif || ""
  const featuredImage = activite._embedded?.["wp:featuredmedia"]?.[0]

  return (
    <PageHeader title={title} image={featuredImage?.source_url || "/diverse-outdoor-activities.png"} >

      <div className="container mx-auto px-4 py-12">
        {description && (
          <div className="prose prose-stone mb-12 max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
        )}

        {/* CTA Section */}
        <section className="rounded-lg bg-muted p-8 text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold">Intéressé par cette activité ?</h2>
          <p className="mb-6 text-muted-foreground">Découvrez nos séjours incluant cette activité</p>
          <Button asChild size="lg">
            <Link href="/sejours-collectifs">Voir les séjours</Link>
          </Button>
        </section>
      </div>
    </PageHeader>
  )
}
