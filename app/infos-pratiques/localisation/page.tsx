import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export default async function LocalisationPage() {
  const page = await wpApi.getPageBySlug("localisation")

  return (
    <PageHeader
      title={page?.title.rendered || "Localisation"}
      subtitle={page?.acf?.hero?.["sous-titre"]}
      image={page?.acf?.hero?.image || "/placeholder.svg?key=3df6p"}
      color={getColorForPath("/infos-pratiques/localisation")}
    >

      <div className="container mx-auto px-4 py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Comment nous trouver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">En voiture</h3>
                <p className="text-muted-foreground">Informations d'accès en voiture</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">En train</h3>
                <p className="text-muted-foreground">Gare la plus proche et navettes disponibles</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">En avion</h3>
                <p className="text-muted-foreground">Aéroport le plus proche</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {page?.content.rendered && (
          <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }} />
        )}
      </div>
    </PageHeader>
  )
}
