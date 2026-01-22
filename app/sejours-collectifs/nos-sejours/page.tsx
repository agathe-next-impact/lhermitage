import { SejourPricingCard } from "@/components/sejour-pricing-card"
import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"

export default async function NosSejoursPage() {
  console.warn("[v0] NosSejoursPage - Starting to fetch data")

  let page = null
  let sejours: any[] = []

  try {
    const results = await Promise.all([wpApi.getPageByPath("sejours-collectifs/nos-sejours"), wpApi.getSejours()])
    page = results[0]
    sejours = results[1] || []

    console.warn("[v0] NosSejoursPage - Page fetched:", page?.title?.rendered || "No page")
    console.warn("[v0] NosSejoursPage - Page ACF:", JSON.stringify(page?.acf))
    console.warn("[v0] NosSejoursPage - Sejours count:", sejours.length)
  } catch (error) {
    console.error("[v0] Error fetching nos-sejours data:", error instanceof Error ? error.message : error)
  }

  console.warn("[v0] NosSejoursPage - Rendering with sejours:", sejours.length)

  return (
    <div>
      <PageHeader
        title={page?.title?.rendered || "Nos Séjours"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/group-retreat-activities.jpg"}
        color={getColorForPath("/sejours-collectifs/nos-sejours")}
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
              console.warn("[v0] NosSejoursPage - Rendering sejour card:", sejour.id, sejour.title?.rendered)
              return <SejourPricingCard key={sejour.id} sejour={sejour} featured={index === 0} />
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-muted py-12 text-center">
            <p className="mb-2 text-muted-foreground">Aucun séjour disponible pour le moment.</p>
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
