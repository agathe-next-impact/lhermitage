import { Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { getColorForPath } from "@/lib/page-colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

export default async function ContactsPage() {
  const page = await wpApi.getPageBySlug("contacts")

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Contacts"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
        color={getColorForPath("/infos-pratiques/contacts")}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-6 max-w-md mx-auto mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">+33 X XX XX XX XX</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">contact@tiers-lieu-rural.fr</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Adresse du lieu</p>
              </CardContent>
            </Card>
          </div>

          {page?.content.rendered && (
            <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }} />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
