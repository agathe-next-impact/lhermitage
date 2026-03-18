import Image from "next/image"
import {
  Clock,
  Coffee,
  TreePine,
  BedDouble,
  CalendarDays,
  Sun,
  Sunrise,
  Sunset,
  PartyPopper,
  ShoppingBasket,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { wpApi } from "@/lib/wordpress/api"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"

const CAFE_HOURS = [
  { day: "Lundi", hours: "Fermé", closed: true },
  { day: "Mardi", hours: "9h30 – 20h00", note: "AMAP jusqu'à 20h" },
  { day: "Mercredi", hours: "9h30 – 18h00" },
  { day: "Jeudi", hours: "9h30 – 18h00" },
  { day: "Vendredi", hours: "9h30 – 18h00" },
  { day: "Samedi", hours: "Sur évènement", event: true },
  { day: "Dimanche", hours: "Fermé", closed: true },
]

export default async function HorairesPage() {
  const page = await wpApi.getPageByPath("infos-pratiques/jours-et-horaires-douverture")

  return (
    <div>
      <PageHeader
        title={page?.title.rendered || "Jours & horaires d'ouverture"}
        subtitle={page?.acf?.hero?.["sous-titre"] || "Quand venir nous voir"}
        image={page?.acf?.hero?.image?.url || "/rural-retreat-landscape.jpg"}
      />

      <BentoHeaderContent title={page?.acf?.hero?.["sous-titre"] || "Quand venir nous voir"}>
        <div className="container mx-auto px-4 py-8">
          {/* --- En-tête visuel --- */}
          <section className="mb-16">
            <div className="grid gap-6 md:grid-cols-5">
              {/* Illustration / ambiance */}
              <div className="relative h-64 overflow-hidden rounded-xl md:col-span-2 md:h-auto">
                <Image
                  src="/rural-retreat-hermitage-building-nature.jpg"
                  alt="L'Hermitage — un lieu vivant au rythme des saisons"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-lg font-semibold text-white">
                    Un lieu vivant, ouvert au rythme des saisons
                  </p>
                </div>
              </div>

              {/* Résumé rapide */}
              <div className="flex flex-col gap-4 md:col-span-3">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: Coffee,
                      label: "Le Café",
                      desc: "Mardi → Vendredi",
                      color: BRAND_COLORS.coral,
                    },
                    {
                      icon: TreePine,
                      label: "Le Domaine",
                      desc: "Ouvert à la balade",
                      color: BRAND_COLORS.green,
                    },
                    {
                      icon: BedDouble,
                      label: "Séjours",
                      desc: "Sur réservation",
                      color: BRAND_COLORS.teal,
                    },
                  ].map(({ icon: Icon, label, desc, color }) => (
                    <Card key={label} className="relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full w-1"
                        style={{ backgroundColor: color }}
                      />
                      <CardContent className="flex items-center gap-4 p-5">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="h-6 w-6" style={{ color }} />
                        </div>
                        <div>
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card
                  className="flex-1 border-none shadow-none"
                  style={{ backgroundColor: `${BRAND_COLORS.orange}08` }}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: BRAND_COLORS.orange }}
                    >
                      <Sun className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Bon à savoir</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        L&apos;Hermitage est un lieu de vie : les horaires s&apos;adaptent aux
                        saisons, aux évènements et aux résidents. N&apos;hésitez pas à nous
                        contacter pour toute question.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* --- Le Café --- */}
          <section className="mb-16">
            <h2 className="mb-2 text-2xl font-bold flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: BRAND_COLORS.coral }}
              >
                <Coffee className="h-5 w-5 text-white" />
              </div>
              Le Café de l&apos;Hermitage
            </h2>
            <p className="mb-8 text-muted-foreground">
              Espace de convivialité ouvert du mardi au vendredi
            </p>

            <div className="grid gap-6 md:grid-cols-5">
              {/* Tableau horaires */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" style={{ color: BRAND_COLORS.coral }} />
                    Horaires d&apos;ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {CAFE_HOURS.map(({ day, hours, closed, note, event }) => (
                      <div
                        key={day}
                        className={`flex items-center justify-between border-b border-border/50 py-3 last:border-0 ${
                          closed ? "opacity-50" : ""
                        }`}
                      >
                        <span className="font-medium">{day}</span>
                        <div className="flex items-center gap-2">
                          {event && (
                            <PartyPopper
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.orange }}
                            />
                          )}
                          {note && (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: BRAND_COLORS.coral }}
                            >
                              {note}
                            </span>
                          )}
                          <span className={closed ? "text-muted-foreground" : "font-semibold"}>
                            {hours}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Infos complémentaires café */}
              <div className="flex flex-col gap-4 md:col-span-2">
                <Card className="relative overflow-hidden">
                  <div
                    className="absolute right-0 top-0 h-1 w-full"
                    style={{ backgroundColor: BRAND_COLORS.coral }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${BRAND_COLORS.coral}15` }}
                      >
                        <ShoppingBasket className="h-5 w-5" style={{ color: BRAND_COLORS.coral }} />
                      </div>
                      AMAP le mardi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Chaque mardi, le café reste ouvert jusqu&apos;à <strong>20h</strong> pour
                      accueillir la distribution de l&apos;AMAP (Association pour le Maintien
                      d&apos;une Agriculture Paysanne).
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div
                    className="absolute right-0 top-0 h-1 w-full"
                    style={{ backgroundColor: BRAND_COLORS.orange }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${BRAND_COLORS.orange}15` }}
                      >
                        <PartyPopper className="h-5 w-5" style={{ color: BRAND_COLORS.orange }} />
                      </div>
                      Soirées évènements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Le vendredi soir ou le samedi, le café ouvre ses portes lors d&apos;évènements
                      spéciaux : concerts, projections, rencontres… Consultez notre agenda pour ne
                      rien manquer !
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* --- Le Domaine --- */}
          <section className="mb-16">
            <h2 className="mb-2 text-2xl font-bold flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: BRAND_COLORS.green }}
              >
                <TreePine className="h-5 w-5 text-white" />
              </div>
              Le Domaine
            </h2>
            <p className="mb-8 text-muted-foreground">Un parc de 30 hectares ouvert à la balade</p>

            <Card
              className="overflow-hidden border-none shadow-none"
              style={{ backgroundColor: `${BRAND_COLORS.green}08` }}
            >
              <div className="grid md:grid-cols-5">
                <div className="relative hidden md:block md:col-span-2">
                  <Image
                    src="/rural-retreat-center-in-nature-with-mountains.jpg"
                    alt="Le domaine de l'Hermitage — parc et nature"
                    fill
                    sizes="40vw"
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="p-8 md:col-span-3">
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    Le site de l&apos;Hermitage est ouvert à la promenade. Profitez des sentiers,
                    des espaces boisés et du cadre naturel exceptionnel du domaine.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { icon: Sunrise, label: "Accès libre", desc: "en journée" },
                      { icon: TreePine, label: "30 hectares", desc: "de nature" },
                      { icon: CalendarDays, label: "Toute l'année", desc: "selon météo" },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-xl border bg-background p-4"
                      >
                        <Icon className="h-5 w-5 shrink-0" style={{ color: BRAND_COLORS.green }} />
                        <div>
                          <span className="text-sm font-medium">{label}</span>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                    Nous vous demandons simplement de respecter la tranquillité des lieux et de ses
                    résidents.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* --- Séjours --- */}
          <section className="mb-16">
            <h2 className="mb-2 text-2xl font-bold flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: BRAND_COLORS.teal }}
              >
                <BedDouble className="h-5 w-5 text-white" />
              </div>
              Séjours
            </h2>
            <p className="mb-8 text-muted-foreground">
              Hébergement sur réservation, pas d&apos;horaires imposés
            </p>

            <Card className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: BRAND_COLORS.teal }}
              />
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}15` }}
                  >
                    <Sunset className="h-8 w-8" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">À votre rythme</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Les séjours à l&apos;Hermitage se font sur réservation. Il n&apos;y a pas
                      d&apos;horaires d&apos;ouverture ou de fermeture : vous profitez du domaine
                      librement pendant toute la durée de votre séjour, que ce soit pour un
                      séminaire, une retraite ou un séjour individuel.
                    </p>
                  </div>
                </div>
              </CardContent>
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
