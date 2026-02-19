"use client"

import { useCallback, useMemo } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { CategoryCard } from "./category-card"
import { StepNavigation } from "../step-navigation"
import type { SimSejourTemplate } from "@/lib/simulateur/types"
import {
  MIN_GROUP_SIZE,
  MAX_GROUP_SIZE,
  GROUP_SIZE_STEP,
  MIN_DURATION,
  MAX_DURATION,
  CRENEAU_ORDER,
} from "@/lib/simulateur/constants"

export function ProfilForm() {
  const profile = useSimulateurStore((s) => s.profile)
  const setProfile = useSimulateurStore((s) => s.setProfile)
  const initDays = useSimulateurStore((s) => s.initDays)
  const initDaysFromTemplate = useSimulateurStore((s) => s.initDaysFromTemplate)
  const data = useSimulateurData()

  // Compute available créneaux from all activities + services
  const availableCreneaux = useMemo(() => {
    const set = new Set<string>()
    for (const act of data.activites) {
      act.acf.creneaux_disponibles?.forEach((c) => set.add(c))
    }
    for (const srv of data.services) {
      srv.acf.creneaux_disponibles?.forEach((c) => set.add(c))
    }
    return CRENEAU_ORDER.filter((c) => set.has(c))
  }, [data.activites, data.services])

  const handleTemplateSelect = useCallback(
    (template: SimSejourTemplate) => {
      setProfile({
        category: template.category ?? null,
        templateSlug: template.slug,
      })
      if (template.acf.duree_jours) {
        setProfile({ duration: template.acf.duree_jours })
      }
    },
    [setProfile]
  )

  const handleBeforeNext = useCallback(() => {
    if (!profile.templateSlug) return false

    // Chercher le template sélectionné pour son programme par défaut
    const selectedTemplate = data.templates.find((t) => t.slug === profile.templateSlug)
    const programmeDefaut = selectedTemplate?.acf.programme_defaut

    if (programmeDefaut && programmeDefaut.length > 0) {
      // Pré-remplir les journées depuis le programme du template
      initDaysFromTemplate(programmeDefaut, profile.duration, availableCreneaux)
    } else {
      // Fallback : créneaux vides
      initDays(profile.duration, availableCreneaux)
    }
    return true
  }, [
    profile.templateSlug,
    profile.duration,
    initDays,
    initDaysFromTemplate,
    availableCreneaux,
    data.templates,
  ])

  const canProceed = !!profile.templateSlug && profile.groupSize >= MIN_GROUP_SIZE

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Catégorie */}
      <section>
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-wide text-brand-dark mb-2">
          Quel type de séjour recherchez-vous ?
        </h2>
        <p className="text-muted-foreground text-base mb-6">
          Choisissez la thématique qui correspond à vos objectifs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.templates.map((tpl) => (
            <CategoryCard
              key={tpl.slug}
              template={tpl}
              isSelected={profile.templateSlug === tpl.slug}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>
      </section>

      {/* Taille du groupe */}
      <section>
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-wide text-brand-dark mb-4">
          Combien de participants ?
        </h2>
        <div className="flex items-center gap-6">
          <input
            type="range"
            min={MIN_GROUP_SIZE}
            max={MAX_GROUP_SIZE}
            step={GROUP_SIZE_STEP}
            value={profile.groupSize}
            onChange={(e) => setProfile({ groupSize: Number(e.target.value) })}
            className="flex-1 accent-[#2A4A51]"
          />
          <div className="bg-[#2A4A51] text-white rounded-xl p-4 text-center min-w-[100px]">
            <span className="text-3xl font-bold block">{profile.groupSize}</span>
            <span className="block text-xs text-white/70">personnes</span>
          </div>
        </div>
      </section>

      {/* Durée */}
      <section>
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-wide text-brand-dark mb-4">
          Combien de jours ?
        </h2>
        <div className="flex gap-3">
          {Array.from({ length: MAX_DURATION - MIN_DURATION + 1 }, (_, i) => MIN_DURATION + i).map(
            (d) => (
              <button
                key={d}
                type="button"
                onClick={() => setProfile({ duration: d })}
                className={`flex flex-col items-center rounded-full px-6 py-3 transition-all duration-200 ${
                  profile.duration === d
                    ? "bg-[#2A4A51] text-white shadow-lg font-bold"
                    : "bg-white border-2 border-border hover:border-[#2A4A51]/40"
                }`}
              >
                <span className="text-2xl font-bold">{d}</span>
                <span
                  className={`text-xs ${profile.duration === d ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {d === 1 ? "jour" : "jours"}
                </span>
              </button>
            )
          )}
        </div>
      </section>

      {/* Contact (optionnel à cette étape) */}
      <section className="bg-muted/30 rounded-xl p-6 border">
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-wide text-brand-dark mb-2">
          Vos coordonnées
        </h2>
        <p className="text-muted-foreground text-base mb-4">
          Facultatif à cette étape — vous pourrez les renseigner avant de demander un devis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Votre nom"
            value={profile.contactName}
            onChange={(e) => setProfile({ contactName: e.target.value })}
            className="px-4 py-2.5 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors"
          />
          <input
            type="text"
            placeholder="Entreprise"
            value={profile.contactCompany}
            onChange={(e) => setProfile({ contactCompany: e.target.value })}
            className="px-4 py-2.5 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={profile.contactEmail}
            onChange={(e) => setProfile({ contactEmail: e.target.value })}
            className="px-4 py-2.5 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors"
          />
          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={profile.contactPhone}
            onChange={(e) => setProfile({ contactPhone: e.target.value })}
            className="px-4 py-2.5 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors"
          />
        </div>
      </section>

      <StepNavigation
        currentStep="profil"
        canProceed={canProceed}
        onBeforeNext={handleBeforeNext}
      />
    </div>
  )
}
