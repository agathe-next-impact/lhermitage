import { Mail, Phone, MapPin, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { ContactForm } from "@/app/reserver/contact-form"

interface ContactTelephone {
  numero: string
  label?: string
}

interface ContactMember {
  nom: string
  role: string
  organisation?: string
  photo?: { url: string; alt?: string }
  email?: string
  telephones?: ContactTelephone[]
  adresse?: string
}

const FALLBACK_MEMBERS: ContactMember[] = [
  {
    nom: "Laëtitia LAFRANCE",
    role: "Directrice opérationnelle Séjours Inspirants et RH de l'Hermitage",
    telephones: [{ numero: "06 21 17 03 17" }],
    email: "laetitia@hermitagelelab.com",
  },
  {
    nom: "Charlotte BOUREZ",
    role: "Gérante café/cantine associatif La Mère Mitage et Médiatrice de l'Espace de Vie Sociale",
    organisation: "PPH Hermitage Expérimentations — Tiers Lieu Hermitage",
    telephones: [
      { numero: "06 34 50 29 63", label: "Association" },
      { numero: "06 29 39 04 21", label: "Personnel" },
    ],
  },
  {
    nom: "Latifa DANFAKHA",
    role: "Co-fondatrice & Directrice Générale",
    organisation: "L'Hermitage Impact & Transitions — Tiers Lieu Hermitage",
    email: "latifa@hermitagelelab.com",
    telephones: [{ numero: "06 14 75 71 26" }],
    adresse: "17 rue de l'Hermitage, 60350 Autrêches",
  },
  {
    nom: "Jean KARINTHI",
    role: "Président de la Foncière Coopérative de l'Hermitage",
    organisation: "SCIC Hermitage Lab — Tiers Lieu Hermitage",
    email: "jean@hermitagelelab.com",
  },
]

function formatPhone(numero: string, label?: string): string {
  return label ? `${numero} (${label})` : numero
}

export default async function ContactsPage() {
  const page = await wpApi.getPageByPath("infos-pratiques/contacts")

  const acfMembers = page?.acf?.contacts_equipe as ContactMember[] | undefined
  const members = acfMembers?.length ? acfMembers : FALLBACK_MEMBERS

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Contacts"}
        subtitle={page?.acf?.hero?.["sous-titre"]}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"]}>
        <div className="container mx-auto px-4 py-12">
          {/* Grille des contacts */}
          <h2 className="text-2xl font-bold mb-8 text-center">L&apos;équipe</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {members.map((member) => (
              <Card key={member.nom} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{member.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-snug">{member.role}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm mt-auto">
                  {member.organisation && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{member.organisation}</span>
                    </div>
                  )}
                  {member.telephones?.map((t) => {
                    const display = formatPhone(t.numero, t.label)
                    return (
                      <div key={display} className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <a href={`tel:${t.numero.replace(/\s/g, "")}`} className="hover:underline">
                          {display}
                        </a>
                      </div>
                    )
                  })}
                  {member.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:underline">
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.adresse && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{member.adresse}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulaire de contact */}
          <h2 className="text-2xl font-bold mb-8 text-center">Nous contacter</h2>
          <ContactForm />

          {page?.content.rendered && (
            <div
              className="prose prose-stone max-w-none mt-12"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
