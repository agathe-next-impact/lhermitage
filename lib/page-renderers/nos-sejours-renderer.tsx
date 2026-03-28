import dynamic from "next/dynamic"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { SejoursHeader } from "@/components/layout/sejours-header"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import type { WPPage, WPPost, ServiceACF, SeminairesACF } from "@/lib/wordpress/types"

const SeminairesPage = dynamic(() =>
  import("@/components/seminaires-page").then((m) => m.SeminairesPage)
)

const PALETTE = [
  BRAND_COLORS.coral,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
  BRAND_COLORS.darkBlue,
]

interface Props {
  page: WPPage
  extra: {
    seminairesData: SeminairesACF | null
    services: WPPost<ServiceACF>[]
  }
}

export default function NosSejoursRenderer({ page, extra }: Props) {
  const { seminairesData, services } = extra

  // Extract unique service types from services taxonomy
  const serviceTypesMap = new Map<
    string,
    {
      id: string
      name: string
      slug: string
      image?: { url: string; alt: string } | null
      color: string
    }
  >()
  let colorIdx = 0
  services.forEach((service) => {
    const term = service._embedded?.["wp:term"]?.[0]?.[0]
    if (term && !serviceTypesMap.has(term.slug)) {
      serviceTypesMap.set(term.slug, {
        id: term.id.toString(),
        name: term.name,
        slug: term.slug,
        image: term.image || null,
        color: PALETTE[colorIdx % PALETTE.length],
      })
      colorIdx++
    }
  })
  const serviceTypes = Array.from(serviceTypesMap.values())

  const pageTitle = page?.title.rendered || "Nos Séjours"
  const bentoTitle = page?.acf?.hero?.["sous-titre"]

  // Séminaires ACF -> header plein écran avec vidéo/image
  if (seminairesData) {
    return (
      <div className="overflow-x-clip">
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
            <SeminairesPage acf={seminairesData} serviceTypes={serviceTypes} />
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
