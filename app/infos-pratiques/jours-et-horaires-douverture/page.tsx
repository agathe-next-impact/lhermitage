import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export default async function HorairesPage() {
  const page = await wpApi.getPageBySlug("jours-et-horaires-douverture")

  return (
    <PageHeader
      title={page?.title.rendered || "Jours et horaires d'ouverture"}
      subtitle={page?.acf?.hero?.["sous-titre"]}
      image={page?.acf?.hero?.image || "/placeholder.svg?key=1gh8q"}
      color={getColorForPath("/infos-pratiques/jours-et-horaires-douverture")}
    >

      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horaires d'ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium">Lundi - Vendredi</span>
                <span className="text-muted-foreground">9h00 - 18h00</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-medium">Samedi</span>
                <span className="text-muted-foreground">10h00 - 17h00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Dimanche</span>
                <span className="text-muted-foreground">Fermé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {page?.content.rendered && (
          <div
            className="prose prose-stone mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
          />
        )}
      </div>
    </PageHeader>
  )
}
