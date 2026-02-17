"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { SEJOUR_CATEGORIES, type SejourCategory } from "@/lib/simulateur/types"
import { cn } from "@/lib/utils"

const TYPE_CRENEAU_LABELS: Record<string, string> = {
  activite: "Activit\u00e9",
  repas: "Repas",
  travail: "Session de travail",
  libre: "Temps libre",
  soiree: "Soir\u00e9e",
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
        if (slot.espace_slug) slugs.add(slot.espace_slug)
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
          Votre s\u00e9jour sur mesure
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {categoryInfo
            ? `Un s\u00e9jour ${categoryInfo.label.toLowerCase()} de ${profile.duration} jour${profile.duration > 1 ? "s" : ""} pour ${profile.groupSize} personnes`
            : `Un s\u00e9jour de ${profile.duration} jour${profile.duration > 1 ? "s" : ""} pour ${profile.groupSize} personnes`}
          {nights > 0 ? ` et ${nights} nuit${nights > 1 ? "s" : ""}` : ""} au c\u0153ur du domaine
          de L&apos;Hermitage.
        </p>
      </div>

      {/* Programme jour par jour */}
      {days.length > 0 && (
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <motion.div
              key={day.dayNumber}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2A4A51] text-white text-sm font-bold">
                  {day.dayNumber}
                </div>
                <h3 className="font-heading uppercase font-bold text-lg text-brand-dark">
                  Jour {day.dayNumber}
                </h3>
              </div>

              <div className="ml-11 space-y-3">
                {day.slots.map((slot) => {
                  const activite = slot.activite_slug
                    ? data.activites.find((a) => a.slug === slot.activite_slug)
                    : null
                  const espace = slot.espace_slug
                    ? data.espaces.find((e) => e.slug === slot.espace_slug)
                    : null

                  const hasContent = activite || espace || slot.label_personnalise

                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        activite
                          ? "border-l-4 border-l-[#E75754] border-t border-r border-b"
                          : espace
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

                      {activite && (
                        <div className="mt-2">
                          <p className="font-semibold text-brand-dark">{activite.acf.nom}</p>
                          {activite.acf.description_immersive && (
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed italic">
                              {activite.acf.description_immersive}
                            </p>
                          )}
                        </div>
                      )}

                      {espace && !activite && (
                        <div className="mt-2">
                          <p className="font-semibold text-brand-dark">{espace.acf.nom}</p>
                          {espace.acf.description_immersive && (
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed italic">
                              {espace.acf.description_immersive}
                            </p>
                          )}
                        </div>
                      )}

                      {!activite && !espace && slot.label_personnalise && (
                        <p className="mt-1 font-medium text-brand-dark">
                          {slot.label_personnalise}
                        </p>
                      )}

                      {activite && espace && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Lieu : {espace.acf.nom}
                          {espace.acf.ambiance ? ` \u2014 ambiance ${espace.acf.ambiance}` : ""}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Espaces utilis\u00e9s */}
      {usedEspaces.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Les espaces de votre s\u00e9jour</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usedEspaces.map((espace) => (
              <div
                key={espace.slug}
                className="rounded-lg border-l-4 border-l-[#56939F] border border-border p-4"
              >
                <p className="font-semibold text-brand-dark">{espace.acf.nom}</p>
                {espace.acf.description_immersive && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed italic">
                    {espace.acf.description_immersive}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {espace.acf.capacite_max && (
                    <span>Capacit\u00e9 : {espace.acf.capacite_max} pers.</span>
                  )}
                  {espace.acf.ambiance && <span>Ambiance : {espace.acf.ambiance}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* H\u00e9bergements */}
      {resolvedAccommodations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Vos h\u00e9bergements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resolvedAccommodations.map(({ heb, quantity }) => (
              <div key={heb.slug} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-dark">{heb.acf.nom}</p>
                  <span className="text-sm font-medium text-brand-coral">x{quantity}</span>
                </div>
                {heb.acf.description_immersive && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed italic">
                    {heb.acf.description_immersive}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {heb.acf.capacite_personnes && (
                    <span>{heb.acf.capacite_personnes} pers. / unit\u00e9</span>
                  )}
                  {heb.acf.niveau_confort && (
                    <span className="capitalize">{heb.acf.niveau_confort}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {resolvedServices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Services s\u00e9lectionn\u00e9s</h3>
          <div className="flex flex-wrap gap-2">
            {resolvedServices.map(({ svc, option_index }) => {
              const optionLabel =
                option_index !== undefined && svc.acf.options?.[option_index]
                  ? ` \u2014 ${svc.acf.options[option_index].nom}`
                  : ""
              return (
                <span
                  key={svc.slug}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#2A4A51]/10 text-[#2A4A51] text-sm"
                >
                  <span className="font-medium">{svc.acf.nom}</span>
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
