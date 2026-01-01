import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { wpApi } from "@/lib/wordpress/api"
import Link from "next/link"
import { stripHtml } from "@/lib/utils"

export default async function SejoursIndividuelsPage() {
  const [page, hebergements] = await Promise.all([wpApi.getPageBySlug("sejours-individuels"), wpApi.getHebergements()])

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Séjours Individuels"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/placeholder.svg?key=8xk2p"}
      />

      <div className="container mx-auto px-4 py-12">
        {page?.content.rendered && (
          <div
            className="prose prose-stone mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        )}

        <section className="mb-12">
          <h2 className="mb-6 font-serif text-3xl font-extrabold uppercase">Nos hébergements disponibles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hebergements.map((hebergement) => (
              <Card key={hebergement.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{hebergement.acf?.nom || hebergement.title.rendered}</CardTitle>
                  {hebergement.acf?.descriptif && (
                    <CardDescription className="line-clamp-2">{stripHtml(hebergement.acf.descriptif)}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/hebergement/${hebergement.slug}`}>Voir détails</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-muted p-8 text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold">Prêt à réserver ?</h2>
          <p className="mb-6 text-muted-foreground">Consultez nos disponibilités et réservez votre séjour individuel</p>
          <Button asChild size="lg">
            <Link href="/sejours-individuels/reserver">Réserver maintenant</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
