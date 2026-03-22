import Image from "next/image"
import {
  MapPin,
  Car,
  Train,
  Bike,
  Bus,
  Navigation,
  Clock,
  Phone,
  Users,
  Handshake,
  Footprints,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { LocalisationMap } from "@/components/localisation-map"
import type { LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  car: Car,
  train: Train,
  bike: Bike,
  bus: Bus,
  plane: Navigation,
  walk: Footprints,
  phone: Phone,
  "map-pin": MapPin,
  users: Users,
  handshake: Handshake,
}

const DEFAULT_ACCES_COLORS = [BRAND_COLORS.coral, BRAND_COLORS.teal, BRAND_COLORS.green]

function getIcon(key?: string): LucideIcon {
  return (key && ICON_MAP[key]) || MapPin
}

/* ---------- Fallback data (used when ACF fields are empty) ---------- */

const FALLBACK_ADRESSE = {
  ligne_1: "17 rue de l'Hermitage",
  ligne_2: "60350 Autrêches",
  description:
    "Le domaine est niché au carrefour des vallées de l'Aisne et de l'Oise, entre les villes de Soissons et Compiègne.",
  image: undefined as undefined,
  carte_url: undefined as undefined,
}

const FALLBACK_ACCES = [
  {
    titre: "En voiture ou en bus",
    icone: "car",
    couleur: BRAND_COLORS.coral,
    duree: "~1h30 depuis Paris",
    contenu:
      "<ul><li><strong>~25 min</strong> depuis Compiègne</li><li><strong>~35 min</strong> depuis Soissons</li><li><strong>~40 min</strong> depuis Villers-Cotterêts</li></ul>",
  },
  {
    titre: "En train",
    icone: "train",
    couleur: BRAND_COLORS.teal,
    duree: "~1h30 depuis Paris",
    contenu:
      "<p>Train jusqu'à la <strong>gare de Compiègne</strong>, puis navette jusqu'au domaine.</p><p>L'équipe peut organiser votre transfert depuis la gare.</p>",
  },
  {
    titre: "À vélo",
    icone: "bike",
    couleur: BRAND_COLORS.green,
    duree: "~1h30 depuis Compiègne",
    contenu:
      "<p><strong>30 km</strong> depuis la gare de Compiègne — une belle balade à travers la campagne picarde pour les plus sportifs.</p>",
  },
]

const FALLBACK_LOGISTIQUE = {
  titre: "Accompagnement & logistique",
  texte:
    "Pour faciliter votre arrivée, l'équipe de l'Hermitage propose d'organiser votre parcours avec vous.",
  services: [
    { label: "Bus & mini-bus", icone: "bus" },
    { label: "Taxis", icone: "car" },
    { label: "Partenaires locaux", icone: "phone" },
  ],
  note: "L'équipe se charge de la réservation en faisant appel à ses partenaires locaux, pour un trajet sans stress.",
  image: undefined as undefined,
}

export default async function LocalisationPage() {
  const page = await wpApi.getPageByPath("infos-pratiques/localisation")

  const loc = page?.acf?.localisation_page
  const adresse = loc?.adresse ?? FALLBACK_ADRESSE
  const accesItems = loc?.moyens_acces?.length ? loc.moyens_acces : FALLBACK_ACCES
  const logistique = loc?.logistique?.titre ? loc.logistique : FALLBACK_LOGISTIQUE
  const adresseImage = adresse.image?.url || "/rural-retreat-hermitage-building-nature.jpg"
  const logistiqueImage =
    logistique.image?.url || "/rural-retreat-center-in-nature-with-mountains.jpg"

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Localisation"}
        subtitle={page?.acf?.hero?.["sous-titre"] || "Comment nous rejoindre"}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"] || "Comment nous rejoindre"}>
        <div className="container mx-auto md:p-2">
          {/* --- Adresse & carte --- */}
          <section className="mb-16">
            <div className="grid gap-2 md:grid-cols-5">
              {/* Carte interactive */}
              <div className="md:col-span-3 overflow-hidden rounded-xl border shadow-sm h-[350px] md:h-[420px]">
                <LocalisationMap />
              </div>

              {/* Bloc adresse */}
              <div className="flex flex-col gap-4 md:col-span-2">
                <Card className="flex-1 border-none bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: BRAND_COLORS.coral }}
                      >
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      Adresse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adresse.ligne_1 && <p className="text-lg font-semibold">{adresse.ligne_1}</p>}
                    {adresse.ligne_2 && <p className="text-lg font-semibold">{adresse.ligne_2}</p>}
                    {adresse.description && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {adresse.description}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Image d'ambiance */}
                <div className="relative h-44 overflow-hidden rounded-xl">
                  <Image
                    src={adresseImage}
                    alt="Vue du domaine de l'Hermitage"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* --- Moyens d'accès --- */}
          <section className="mb-16">
            <h2 className="mb-2 text-2xl font-bold">Moyens d&apos;accès</h2>
            <p className="mb-8 text-muted-foreground">Notamment depuis Paris</p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {accesItems.map((item, i) => {
                const color = item.couleur || DEFAULT_ACCES_COLORS[i % DEFAULT_ACCES_COLORS.length]
                const Icon = getIcon(item.icone)
                return (
                  <Card
                    key={item.titre || i}
                    className="relative overflow-hidden border-none shadow-md"
                    style={{ backgroundColor: color }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {item.titre}
                      </CardTitle>
                      {item.duree && (
                        <CardDescription className="flex items-center gap-1.5 pt-1 text-white/80">
                          <Clock className="h-4 w-4" />
                          {item.duree}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {item.contenu && (
                      <CardContent>
                        <div
                          className="text-sm text-white/90 leading-relaxed [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_p+p]:mt-3 [&_strong]:text-white"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.contenu) }}
                        />
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </section>

          {/* --- Accompagnement logistique --- */}
          <section className="mb-16">
            <Card className="overflow-hidden border-none shadow-none bg-transparent">
              <div className="grid md:grid-cols-5">
                <div className="relative hidden md:block md:col-span-2">
                  <Image
                    src={logistiqueImage}
                    alt="Le domaine de l'Hermitage dans son environnement naturel"
                    fill
                    sizes="40vw"
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="md:pl-8 md:py-8 md:col-span-3">
                  <h2 className="mb-4 text-2xl font-bold flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: BRAND_COLORS.rose }}
                    >
                      <Bus className="h-5 w-5 text-white" />
                    </div>
                    {logistique.titre}
                  </h2>
                  {logistique.texte && (
                    <p className="mb-3 text-muted-foreground leading-relaxed">{logistique.texte}</p>
                  )}
                  {logistique.note && (
                    <p className="mt-3 mb-6 text-sm text-muted-foreground">{logistique.note}</p>
                  )}
                  {logistique.services && logistique.services.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-3">
                      {logistique.services.map((svc) => {
                        const SvcIcon = getIcon(svc.icone)
                        return (
                          <div
                            key={svc.label}
                            className="flex items-center gap-3 rounded-xl border-none p-4 shadow-sm"
                            style={{ backgroundColor: BRAND_COLORS.rose }}
                          >
                            <SvcIcon className="h-5 w-5 shrink-0 text-white" />
                            <span className="text-sm font-medium text-white">{svc.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </section>

          {/* --- Contenu WordPress éventuel --- */}
          {page?.content.rendered && (
            <div
              className="prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          )}
        </div>
      </BentoHeaderContent>
    </div>
  )
}
