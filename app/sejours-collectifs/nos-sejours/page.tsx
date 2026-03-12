import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { SejoursHeader } from "@/components/layout/sejours-header"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { REVALIDATION } from "@/lib/constants"

const SeminairesPage = dynamic(() =>
  import("@/components/seminaires-page").then((m) => m.SeminairesPage)
)

export const revalidate = REVALIDATION.listing

export default async function NosSejoursPage() {
  const [page, seminairesData] = await Promise.all([
    wpApi.getPageByPath("sejours-collectifs/nos-sejours"),
    wpApi.getSeminairesData("sejours-collectifs/nos-sejours"),
  ])

  if (!page && !seminairesData) {
    notFound()
  }

  const pageTitle = page?.title.rendered || "Nos Séjours"
  const bentoTitle = page?.acf?.hero?.["sous-titre"]

  // Séminaires ACF → header plein écran avec vidéo/image
  if (seminairesData) {
    return (
      <div>
        <SejoursHeader
          title={pageTitle}
          video={seminairesData.hero_seminaires?.video}
          image={seminairesData.hero_seminaires?.image}
          accroche={seminairesData.hero_seminaires?.accroche}
          sousTitre={seminairesData.hero_seminaires?.sous_titre}
          ctaTexte={seminairesData.hero_seminaires?.cta_texte}
          ctaLien={seminairesData.hero_seminaires?.cta_lien}
        />
        <BentoHeaderContent title={seminairesData.promesse?.titre || bentoTitle}>
          <div className="relative z-10">
            <SeminairesPage acf={seminairesData} />
          </div>
        </BentoHeaderContent>
      </div>
    )
  }

  // Fallback : page WordPress standard
  const heroImage = page?.acf?.hero?.image?.url || "/group-retreat-activities.jpg"

  return (
    <div>
      <PageHeader title={pageTitle} subtitle={bentoTitle} image={heroImage} />
      <BentoHeaderContent title={bentoTitle}>
        <div className="container mx-auto px-4 py-16">
          {page?.content?.rendered && (
            <div
              className="prose prose-stone mx-auto max-w-3xl"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
