"use client"

import { useMemo } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { SEJOUR_CATEGORIES, type SejourCategory } from "@/lib/simulateur/types"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

const TYPE_CRENEAU_LABELS: Record<string, string> = {
  activite: "Activité",
  repas: "Repas",
  travail: "Session de travail",
  libre: "Temps libre",
  soiree: "Soirée",
}

export function NarrativeSummary() {
  const profile = useSimulateurStore((s) => s.profile)
  const days = useSimulateurStore((s) => s.days)
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const selectedServices = useSimulateurStore((s) => s.selectedServices)
  const data = useSimulateurData()

  const categoryInfo = profile.category
    ? SEJOUR_CATEGORIES[profile.category as SejourCategory]
    : null

  const nights = Math.max(0, profile.duration - 1)

  // Collect all unique espaces used across the programme
  const usedEspaces = useMemo(() => {
    const slugs = new Set<string>()
    for (const day of days) {
      for (const slot of day.slots) {
        for (const slug of slot.espace_slugs ?? []) {
          slugs.add(slug)
        }
      }
    }
    return data.espaces.filter((e) => slugs.has(e.slug))
  }, [days, data.espaces])

  // Collect resolved accommodations
  const resolvedAccommodations = useMemo(
    () =>
      accommodations
        .map((acc) => {
          const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
          return heb ? { ...acc, heb } : null
        })
        .filter(Boolean) as Array<{
        hebergement_slug: string
        quantity: number
        heb: (typeof data.hebergements)[0]
      }>,
    [accommodations, data]
  )

  // Collect resolved services
  const resolvedServices = useMemo(
    () =>
      selectedServices
        .map((sel) => {
          const svc = data.services.find((sv) => sv.slug === sel.service_slug)
          return svc ? { ...sel, svc } : null
        })
        .filter(Boolean) as Array<{
        service_slug: string
        option_index?: number
        svc: (typeof data.services)[0]
      }>,
    [selectedServices, data]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Intro */}
      <div className="space-y-3">
        <h2 className="font-heading uppercase font-extrabold text-3xl text-[#2A4A51] tracking-wide">
          Votre séjour sur mesure
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {categoryInfo
            ? `Un séjour ${categoryInfo.label.toLowerCase()} de ${profile.duration} jour${profile.duration > 1 ? "s" : ""} pour ${profile.groupSize} personnes`
            : `Un séjour de ${profile.duration} jour${profile.duration > 1 ? "s" : ""} pour ${profile.groupSize} personnes`}
          {nights > 0 ? ` et ${nights} nuit${nights > 1 ? "s" : ""}` : ""} au cœur du domaine de
          L&apos;Hermitage.
        </p>
      </div>

      {/* Programme jour par jour — accordéon */}
      {days.length > 0 && (
        <Accordion type="multiple" defaultValue={[]}>
          {days.map((day, dayIndex) => {
            // Count filled slots for this day
            const filledSlots = day.slots.filter(
              (s) =>
                (s.activite_slugs?.length ?? 0) > 0 ||
                (s.espace_slugs?.length ?? 0) > 0 ||
                (s.service_slugs?.length ?? 0) > 0
            ).length

            return (
              <AccordionItem
                key={day.dayNumber}
                value={`day-${day.dayNumber}`}
                className="border-b-0 mb-3"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
                  className="rounded-xl border bg-background"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2A4A51] text-white text-sm font-bold flex-shrink-0">
                        {day.dayNumber}
                      </div>
                      <div className="text-left">
                        <h3 className="font-heading uppercase font-bold text-lg text-brand-dark">
                          Jour {day.dayNumber}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {filledSlots} créneau{filledSlots > 1 ? "x" : ""} · {day.slots.length}{" "}
                          plage{day.slots.length > 1 ? "s" : ""} horaire
                          {day.slots.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="space-y-3">
                      {day.slots.map((slot) => {
                        const activites = (slot.activite_slugs ?? [])
                          .map((s) => data.activites.find((a) => a.slug === s))
                          .filter((x): x is NonNullable<typeof x> => !!x)
                        const espaces = (slot.espace_slugs ?? [])
                          .map((s) => data.espaces.find((e) => e.slug === s))
                          .filter((x): x is NonNullable<typeof x> => !!x)
                        const services = (slot.service_slugs ?? [])
                          .map((s) => data.services.find((sv) => sv.slug === s))
                          .filter((x): x is NonNullable<typeof x> => !!x)

                        const hasContent =
                          activites.length > 0 ||
                          espaces.length > 0 ||
                          services.length > 0 ||
                          slot.label_personnalise

                        return (
                          <div
                            key={slot.id}
                            className={cn(
                              "rounded-lg border p-4 transition-colors",
                              activites.length > 0
                                ? "border-l-4 border-l-[#E75754] border-t border-r border-b"
                                : espaces.length > 0
                                  ? "border-l-4 border-l-[#56939F] border-t border-r border-b"
                                  : "bg-muted/30 border-border"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                {slot.heure_debut}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                                {TYPE_CRENEAU_LABELS[slot.type_creneau] || slot.type_creneau}
                              </span>
                            </div>

                            {activites.map((activite) => (
                              <div key={activite.slug} className="mt-2 flex items-start gap-3">
                                {activite.featuredImage && (
                                  <Image
                                    src={
                                      activite.featuredImage.sizes?.thumbnail ??
                                      activite.featuredImage.url
                                    }
                                    alt={activite.featuredImage.alt || activite.acf.nom}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-brand-dark">
                                    {decodeHtmlEntities(activite.acf.nom)}
                                  </p>
                                  {activite.acf.description_immersive && (
                                    <div
                                      className="text-sm text-muted-foreground mt-1 leading-relaxed italic prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(activite.acf.description_immersive),
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}

                            {espaces.map((espace) => (
                              <div key={espace.slug} className="mt-2 flex items-start gap-3">
                                {espace.featuredImage && (
                                  <Image
                                    src={
                                      espace.featuredImage.sizes?.thumbnail ??
                                      espace.featuredImage.url
                                    }
                                    alt={espace.featuredImage.alt || espace.acf.nom}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#56939F]">
                                    {decodeHtmlEntities(espace.acf.nom)}
                                  </p>
                                  {espace.acf.description_immersive && (
                                    <div
                                      className="text-sm text-muted-foreground mt-1 leading-relaxed italic prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(espace.acf.description_immersive),
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}

                            {services.map((service) => (
                              <div key={service.slug} className="mt-2 flex items-start gap-3">
                                {service.featuredImage && (
                                  <Image
                                    src={
                                      service.featuredImage.sizes?.thumbnail ??
                                      service.featuredImage.url
                                    }
                                    alt={service.featuredImage.alt || service.acf.nom}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#2A4A51]">
                                    {decodeHtmlEntities(service.acf.nom)}
                                  </p>
                                  {service.acf.description_courte && (
                                    <div
                                      className="text-sm text-muted-foreground mt-1 leading-relaxed italic prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(service.acf.description_courte),
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}

                            {!hasContent && slot.label_personnalise && (
                              <p className="mt-1 font-medium text-brand-dark">
                                {slot.label_personnalise}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </motion.div>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Espaces utilisés */}
      {usedEspaces.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Les espaces de votre séjour</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usedEspaces.map((espace) => (
              <div
                key={espace.slug}
                className="rounded-lg border-l-4 border-l-[#56939F] border border-border p-4 flex items-start gap-3"
              >
                {espace.featuredImage && (
                  <Image
                    src={espace.featuredImage.sizes?.thumbnail ?? espace.featuredImage.url}
                    alt={espace.featuredImage.alt || espace.acf.nom}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-brand-dark">
                    {decodeHtmlEntities(espace.acf.nom)}
                  </p>
                  {espace.acf.description_immersive && (
                    <div
                      className="text-sm text-muted-foreground mt-1 leading-relaxed italic prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(espace.acf.description_immersive),
                      }}
                    />
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {espace.acf.capacite_max && (
                      <span>Capacité : {espace.acf.capacite_max} pers.</span>
                    )}
                    {espace.acf.ambiance && <span>Ambiance : {espace.acf.ambiance}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hébergements */}
      {resolvedAccommodations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Vos hébergements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resolvedAccommodations.map(({ heb, quantity }) => (
              <div key={heb.slug} className="rounded-lg border p-4 flex items-start gap-3">
                {heb.featuredImage && (
                  <Image
                    src={heb.featuredImage.sizes?.thumbnail ?? heb.featuredImage.url}
                    alt={heb.featuredImage.alt || heb.acf.nom}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-dark">
                      {decodeHtmlEntities(heb.acf.nom)}
                    </p>
                    <span className="text-sm font-medium text-brand-coral">x{quantity}</span>
                  </div>
                  {heb.acf.description_immersive && (
                    <div
                      className="text-sm text-muted-foreground mt-1 leading-relaxed italic prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(heb.acf.description_immersive),
                      }}
                    />
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {heb.acf.capacite_personnes && (
                      <span>{heb.acf.capacite_personnes} pers. / unité</span>
                    )}
                    {heb.acf.niveau_confort && (
                      <span className="capitalize">{heb.acf.niveau_confort}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {resolvedServices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Services sélectionnés</h3>
          <div className="flex flex-wrap gap-2">
            {resolvedServices.map(({ svc, option_index }) => {
              const optionLabel =
                option_index !== undefined && svc.acf.options?.[option_index]
                  ? ` — ${decodeHtmlEntities(svc.acf.options[option_index].nom)}`
                  : ""
              return (
                <span
                  key={svc.slug}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A4A51]/10 text-[#2A4A51] text-sm"
                >
                  {svc.featuredImage && (
                    <Image
                      src={svc.featuredImage.sizes?.thumbnail ?? svc.featuredImage.url}
                      alt={svc.featuredImage.alt || svc.acf.nom}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <span className="font-medium">{decodeHtmlEntities(svc.acf.nom)}</span>
                  {optionLabel && <span className="ml-1 text-muted-foreground">{optionLabel}</span>}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
