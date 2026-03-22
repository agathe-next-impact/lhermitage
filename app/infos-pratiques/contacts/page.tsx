import { Mail, Phone, MapPin, Building2 } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { ContactForm } from "@/app/reserver/contact-form"
import { BRAND_COLORS, type BrandColor } from "@/lib/theme/colors"

const CARD_COLORS: BrandColor[] = [
  BRAND_COLORS.rose,
  BRAND_COLORS.teal,
  BRAND_COLORS.orange,
  BRAND_COLORS.green,
  BRAND_COLORS.darkBlue,
  BRAND_COLORS.coral,
]

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
        <div className="w-full md:pl-2 md:pt-2">
          {/* Grille des contacts */}
          <div className="grid gap-2 sm:grid-cols-2 mx-auto mb-16">
            {members.map((member, index) => (
              <div
                key={member.nom}
                className="flex gap-4 rounded-lg p-5 text-white"
                style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
              >
                {member.photo && (
                  <img
                    src={member.photo.url}
                    alt={member.photo.alt || member.nom}
                    className="h-16 w-16 rounded-full object-cover shrink-0"
                  />
                )}
                <div className="flex flex-col gap-3 min-w-0">
                  <div>
                    <h3 className="font-semibold leading-tight">{member.nom}</h3>
                    <p className="text-sm text-white leading-snug">{member.role}</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-md bg-white/10 p-3">
                    {member.organisation && (
                      <div className="flex items-start gap-2 text-sm text-white/90">
                        <Building2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{member.organisation}</span>
                      </div>
                    )}
                    {member.telephones?.map((t) => {
                      const display = formatPhone(t.numero, t.label)
                      return (
                        <div key={display} className="flex items-center gap-2 text-sm text-white/90">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <a href={`tel:${t.numero.replace(/\s/g, "")}`} className="hover:underline">
                            {display}
                          </a>
                        </div>
                      )
                    })}
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-white/90">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <a href={`mailto:${member.email}`} className="hover:underline break-all">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.adresse && (
                      <div className="flex items-start gap-2 text-sm text-white/90">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{member.adresse}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire de contact */}
          <h2 className="text-2xl font-bold mb-8">Nous écrire</h2>
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
