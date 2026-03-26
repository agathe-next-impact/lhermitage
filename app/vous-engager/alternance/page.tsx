import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPageByPath } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { RecrutementPage } from "@/components/features/recrutement/recrutement-page"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.listing

const PAGE_PATH = "vous-engager/alternance"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath(PAGE_PATH)
  const title = page?.title?.rendered || "Alternance"
  const description =
    page?.acf?.hero?.["sous-titre"] || "Decouvrez nos offres d'alternance a L'Hermitage"

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  }
}

export default async function AlternancePage() {
  const page = await getPageByPath(PAGE_PATH)
  if (!page) notFound()

  const recrutement = page.acf?.recrutement
  const heroTitle = page.title?.rendered || "Alternance"
  const heroSubtitle = page.acf?.hero?.["sous-titre"]
  const heroImage = page.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"

  return (
    <div>
      <PageHeader title={heroTitle} subtitle={heroSubtitle} image={heroImage} />
      <BentoHeaderContent title={heroSubtitle} lateralImages={page.acf?.hero?.images_laterales}>
        <div className="relative z-10">
          {recrutement ? (
            <RecrutementPage acf={recrutement} />
          ) : (
            page.content?.rendered && (
              <div
                className="prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            )
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
