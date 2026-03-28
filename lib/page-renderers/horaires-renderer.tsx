import Image from "next/image"
import Link from "next/link"
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
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import type { LucideIcon } from "lucide-react"
import type { WPPage } from "@/lib/wordpress/types"

/* ---------- Icon mapping for ACF encarts ---------- */

const ENCART_ICONS: Record<string, LucideIcon> = {
  "shopping-basket": ShoppingBasket,
  "party-popper": PartyPopper,
  coffee: Coffee,
  calendar: CalendarDays,
  clock: Clock,
  info: Info,
}

function getEncartIcon(key?: string): LucideIcon {
  return (key && ENCART_ICONS[key]) || Info
}

/* ---------- Fallback data (used when ACF fields are empty) ---------- */

const FALLBACK_CAFE_HOURS = [
  { jour: "Lundi", heures: "Fermé", ferme: true },
  { jour: "Mardi", heures: "9h30 \u2013 20h00", note: "AMAP jusqu\u2019à 20h" },
  { jour: "Mercredi", heures: "9h30 \u2013 18h00" },
  { jour: "Jeudi", heures: "9h30 \u2013 18h00" },
  { jour: "Vendredi", heures: "9h30 \u2013 18h00" },
  { jour: "Samedi", heures: "Sur évènement", evenement: true },
  { jour: "Dimanche", heures: "Fermé", ferme: true },
]

const FALLBACK_CAFE_ENCARTS = [
  {
    titre: "AMAP le mardi",
    texte:
      "Chaque mardi, le café reste ouvert jusqu\u2019à 20h pour accueillir la distribution de l\u2019AMAP (Association pour le Maintien d\u2019une Agriculture Paysanne).",
    icone: "shopping-basket",
    couleur: BRAND_COLORS.coral,
  },
  {
    titre: "Soirées évènements",
    texte:
      "Le vendredi soir ou le samedi, le café ouvre ses portes lors d\u2019évènements spéciaux\u00a0: concerts, projections, rencontres\u2026 Consultez notre agenda pour ne rien manquer\u00a0!",
    icone: "party-popper",
    couleur: BRAND_COLORS.darkBlue,
  },
]

const FALLBACK_DOMAINE = {
  titre: "Le Domaine",
  sous_titre: "Un parc de 30 hectares ouvert à la balade",
  texte:
    "Le site de l\u2019Hermitage est ouvert à la promenade. Profitez des sentiers, des espaces boisés et du cadre naturel exceptionnel du domaine.",
  badges: [
    { label: "Accès libre", description: "en journée" },
    { label: "30 hectares", description: "de nature" },
    { label: "Toute l\u2019année", description: "selon météo" },
  ],
  note: "Nous vous demandons simplement de respecter la tranquillité des lieux et de ses résidents.",
  image: undefined as string | undefined,
}

const FALLBACK_SEJOURS = {
  titre: "Séjours",
  sous_titre: "Hébergement sur réservation, pas d\u2019horaires imposés",
  accroche: "À votre rythme",
  texte:
    "Les séjours à l\u2019Hermitage se font sur réservation. Il n\u2019y a pas d\u2019horaires d\u2019ouverture ou de fermeture\u00a0: vous profitez du domaine librement pendant toute la durée de votre séjour, que ce soit pour un séminaire, une retraite ou un séjour individuel.",
}

const BADGE_ICONS = [Sunrise, TreePine, CalendarDays, Sun, Clock, Coffee]

interface Props {
  page: WPPage
}

export default function HorairesRenderer({ page }: Props) {
  const acf = (page?.acf as any)?.horaires_page
  const imageAmbiance = acf?.image_ambiance?.url || "/rural-retreat-hermitage-building-nature.jpg"
  const accroche = acf?.accroche || "Un lieu vivant, ouvert au rythme des saisons"
  const bonASavoir =
    acf?.bon_a_savoir ||
    "L\u2019Hermitage est un lieu de vie\u00a0: les horaires s\u2019adaptent aux saisons, aux évènements et aux résidents. N\u2019hésitez pas à nous contacter pour toute question."

  const cafe = acf?.cafe
  const cafeTitre = cafe?.titre || "Le Café de l\u2019Hermitage"
  const cafeSousTitre =
    cafe?.sous_titre || "Espace de convivialité ouvert du mardi au vendredi"
  const cafeHoraires = cafe?.horaires?.length ? cafe.horaires : FALLBACK_CAFE_HOURS
  const cafeEncarts = cafe?.encarts?.length ? cafe.encarts : FALLBACK_CAFE_ENCARTS

  const domaine = acf?.domaine?.titre ? acf.domaine : FALLBACK_DOMAINE
  const domaineImage = domaine.image?.url || "/rural-retreat-center-in-nature-with-mountains.jpg"
  const domaineBadges = domaine.badges?.length ? domaine.badges : FALLBACK_DOMAINE.badges

  const sejours = acf?.sejours?.titre ? acf.sejours : FALLBACK_SEJOURS

  return (
    <div className="container mx-auto md:pl-2 md:pt-2">
      {/* --- En-tête visuel --- */}
      <section className="mb-16">
        <div className="grid gap-2 md:grid-cols-5">
          {/* Illustration / ambiance */}
          <div className="relative h-64 overflow-hidden rounded-xl md:col-span-2 md:h-auto">
            <Image
              src={imageAmbiance}
              alt="L'Hermitage — un lieu vivant au rythme des saisons"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-lg font-semibold text-white">{accroche}</p>
            </div>
          </div>

          {/* Résumé rapide */}
          <div className="flex flex-col gap-2 md:col-span-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  icon: Coffee,
                  label: "Le Café",
                  desc: "Mardi \u2192 Vendredi",
                  color: BRAND_COLORS.coral,
                  link: "",
                },
                {
                  icon: TreePine,
                  label: "Le Domaine",
                  desc: "Ouvert à la balade",
                  color: BRAND_COLORS.green,
                  link: "/tiers-lieu-rural/le-domaine-de-l-hermitage",
                },
                {
                  icon: BedDouble,
                  label: "Séjours",
                  desc: "Sur réservation",
                  color: BRAND_COLORS.teal,
                  link: "/sejours-collectifs/nos-sejours",
                },
              ].map(({ icon: Icon, label, desc, color, link: href }) => {
                const content = (
                  <Card
                    key={label}
                    className={`border-none shadow-md${href ? " transition-transform hover:scale-[1.03]" : ""}`}
                    style={{ backgroundColor: color }}
                  >
                    <CardContent className="flex items-center gap-4 md:p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-sm text-white/80">{desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
                return href ? (
                  <Link key={label} href={href}>
                    {content}
                  </Link>
                ) : (
                  <div key={label}>{content}</div>
                )
              })}
            </div>

            <Card
              className="flex-1 border-none shadow-md"
              style={{ backgroundColor: BRAND_COLORS.orange }}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Sun className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Bon à savoir</p>
                  <p className="mt-1 text-sm text-white/80 leading-relaxed">{bonASavoir}</p>
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
          {cafeTitre}
        </h2>
        <p className="mb-8 text-muted-foreground">{cafeSousTitre}</p>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Tableau horaires */}
          <Card className="md:col-span-3 border-none shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-start gap-2 text-lg">
                <Clock className="h-5 w-5" style={{ color: BRAND_COLORS.coral }} />
                Horaires d&apos;ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {cafeHoraires.map((item: any) => (
                  <div
                    key={item.jour}
                    className={`flex items-center justify-between border-b border-border/50 py-3 last:border-0 ${
                      item.ferme ? "opacity-50" : ""
                    }`}
                  >
                    <span className="font-medium">{item.jour}</span>
                    <div className="flex items-center gap-2">
                      {item.evenement && (
                        <PartyPopper
                          className="h-4 w-4"
                          style={{ color: BRAND_COLORS.orange }}
                        />
                      )}
                      {item.note && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: BRAND_COLORS.coral }}
                        >
                          {item.note}
                        </span>
                      )}
                      <span className={item.ferme ? "text-muted-foreground" : "font-semibold"}>
                        {item.heures}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Encarts complémentaires café */}
          <div className="flex flex-col gap-4 md:col-span-2">
            {cafeEncarts.map((encart: any) => {
              const EncartIcon = getEncartIcon(encart.icone)
              return (
                <Card
                  key={encart.titre}
                  className="border-none shadow-md"
                  style={{ backgroundColor: encart.couleur || BRAND_COLORS.coral }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base text-white">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <EncartIcon className="h-5 w-5 text-white" />
                      </div>
                      {encart.titre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/90 leading-relaxed">{encart.texte}</p>
                  </CardContent>
                </Card>
              )
            })}

            <Link
              href="/ecosysteme-innovant/evenements"
              className="w-max inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.rose }}
            >
              <Info className="h-4 w-4" />
              Les prochains événements
            </Link>
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
          {domaine.titre}
        </h2>
        <p className="mb-8 text-muted-foreground">{domaine.sous_titre}</p>

        <Card
          className="overflow-hidden border-none shadow-md pl-6"
          style={{ backgroundColor: BRAND_COLORS.green }}
        >
          <div className="grid md:grid-cols-5">
            <div className="relative hidden md:block md:col-span-2">
              <Image
                src={domaineImage}
                alt="Le domaine de l'Hermitage — parc et nature"
                fill
                sizes="40vw"
                className="object-cover rounded-xl"
              />
            </div>
            <div className="pr-4 md:p-8 md:col-span-3">
              <p className="mb-6 text-white/90 leading-relaxed">{domaine.texte}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {domaineBadges.map((badge: any, i: number) => {
                  const BadgeIcon = BADGE_ICONS[i % BADGE_ICONS.length]
                  return (
                    <div
                      key={badge.label}
                      className="flex items-center gap-3 rounded-xl bg-white/15 p-4"
                    >
                      <BadgeIcon className="h-5 w-5 shrink-0 text-white" />
                      <div>
                        <span className="text-sm font-medium text-white">{badge.label}</span>
                        {badge.description && (
                          <p className="text-xs text-white/70">{badge.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {domaine.note && (
                <p className="mt-6 text-sm text-white/80 leading-relaxed">{domaine.note}</p>
              )}
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
          {sejours.titre}
        </h2>
        <p className="mb-8 text-muted-foreground">{sejours.sous_titre}</p>

        <Card className="border-none shadow-md" style={{ backgroundColor: BRAND_COLORS.teal }}>
          <CardContent className="md:p-8">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <Sunset className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-2">{sejours.accroche}</p>
                <p className="text-white/90 leading-relaxed">{sejours.texte}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link
          href="/sejours-collectifs/nos-sejours"
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND_COLORS.teal }}
        >
          <CalendarDays className="h-4 w-4" />
          Voir les séjours
        </Link>
      </section>

      {/* --- Contenu WordPress éventuel --- */}
      {page?.content.rendered && (
        <div
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
        />
      )}
    </div>
  )
}
