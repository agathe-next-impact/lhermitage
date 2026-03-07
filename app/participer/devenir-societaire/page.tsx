import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { cache } from "react"
import { getPageByPath } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { DevenirSocietairePage } from "@/components/features/devenir-societaire/devenir-societaire-page"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.listing

const getPage = cache(() =>
  getPageByPath("soutenir-le-projet/devenir-societaire-cooperative-fonciere")
)

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPage()
    if (!page) return { title: "Devenir sociétaire" }

    const title = page.title?.rendered || "Devenir sociétaire"
    const description =
      page.acf?.hero?.["sous-titre"] ||
      page.excerpt?.rendered?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      "Devenez sociétaire de L'Hermitage et participez à un projet de tiers-lieu rural"
    const image = page.acf?.hero?.image?.url || "/rural-retreat-hermitage-building-nature.jpg"

    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: image }], type: "website" },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    }
  } catch {
    return { title: "Devenir sociétaire" }
  }
}

export default async function Page() {
  const page = await getPage()

  if (!page) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.hero?.["sous-titre"]}
        image={page.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />
      <BentoHeaderContent title={page.acf?.hero?.["sous-titre"]}>
        <div className="relative z-10">
          <DevenirSocietairePage page={page} />
        </div>
      </BentoHeaderContent>
    </div>
  )
}
