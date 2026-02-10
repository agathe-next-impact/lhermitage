import { Calendar, Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export default async function EvenementsPage() {
  const [page, evenements] = await Promise.all([wpApi.getPageBySlug("evenements"), wpApi.getEvenements()])

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Événements"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image || "/placeholder.svg?key=4jk7m"}
      />

      <div className="container mx-auto px-4 py-12">
        {page?.content.rendered && (
          <div
            className="prose prose-stone mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        )}

        <div className="space-y-6">
          {evenements.map((evenement) => (
            <Card key={evenement.id}>
              <CardHeader>
                <CardTitle>{evenement.acf?.nom || evenement.title.rendered}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {evenement.acf?.date_de_debut && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {evenement.acf.date_de_debut}
                        {evenement.acf.date_de_fin && ` - ${evenement.acf.date_de_fin}`}
                      </span>
                    </div>
                  )}
                  {evenement.acf?.heure_de_debut && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {evenement.acf.heure_de_debut}
                        {evenement.acf.heure_de_fin && ` - ${evenement.acf.heure_de_fin}`}
                      </span>
                    </div>
                  )}
                  {evenement.acf?.localisation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{evenement.acf.localisation.title?.rendered || "Lieu"}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              {evenement.acf?.descriptif && (
                <CardContent>
                  <div
                    className="prose prose-stone max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(evenement.acf.descriptif) }}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
