import { SejourPricingCard } from "@/components/sejour-pricing-card"
import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"

export default async function PacksDeSejoursPage() {
  console.log("[v0] PacksDeSejoursPage - Starting to fetch data")

  let page = null
  let sejours: any[] = []

  try {
    const results = await Promise.all([wpApi.getPageByPath("sejours-collectifs/packs-de-sejours"), wpApi.getSejours()])
    page = results[0]
    sejours = results[1] || []

    console.log("[v0] PacksDeSejoursPage - Page fetched:", page?.title?.rendered || "No page")
    console.log("[v0] PacksDeSejoursPage - Page ACF:", JSON.stringify(page?.acf))
    console.log("[v0] PacksDeSejoursPage - Sejours count:", sejours.length)
    console.log(
      "[v0] PacksDeSejoursPage - Sejours data:",
      JSON.stringify(
        sejours.map((s) => ({
          id: s.id,
          title: s.title?.rendered,
          slug: s.slug,
          hasACF: !!s.acf,
          acf: s.acf,
        })),
      ),
    )
  } catch (error) {
    console.error("[v0] Error fetching packs-de-sejours data:", error instanceof Error ? error.message : error)
  }

  console.log("[v0] PacksDeSejoursPage - Rendering with sejours:", sejours.length)

  return (
    <div>
      <PageHeader
        title={page?.title?.rendered || "Packs de Séjours"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/group-retreat-activities.jpg"}
        color={getColorForPath("/sejours-collectifs/packs-de-sejours")}
      />

      <div className="container mx-auto px-4 py-16">
        {page?.acf?.intro && (
          <div
            className="prose prose-stone mx-auto mb-12 max-w-4xl"
            dangerouslySetInnerHTML={{ __html: page.acf.intro }}
          />
        )}

        {page?.content?.rendered && (
          <div
            className="prose prose-stone mx-auto mb-16 max-w-3xl text-center"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        )}

        {sejours.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sejours.map((sejour, index) => {
              console.log("[v0] PacksDeSejoursPage - Rendering sejour card:", sejour.id, sejour.title?.rendered)
              return <SejourPricingCard key={sejour.id} sejour={sejour} featured={index === 1} />
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-muted py-12 text-center">
            <p className="mb-2 text-muted-foreground">Aucun pack de séjour disponible pour le moment.</p>
            <p className="text-sm text-muted-foreground">
              Vérifiez que des posts de type "sejour" existent dans WordPress.
            </p>
          </div>
        )}

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl bg-gradient-to-br from-[#56939F]/10 to-[#78AD7D]/10 p-8 text-center">
          <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase text-[#535353]">
            Besoin d'un séjour sur mesure ?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Contactez-nous pour créer un séjour personnalisé adapté à vos besoins spécifiques.
          </p>
          <a
            href="mailto:contact@hermitage.fr"
            className="inline-block rounded-full bg-[#E75754] px-8 py-3 font-bold text-white transition-all hover:bg-[#E75754]/90 hover:shadow-lg"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  )
}
