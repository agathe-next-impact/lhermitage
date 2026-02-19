"use client"

import { useState, useMemo, useCallback } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { TimelineEditor } from "@/components/features/simulateur/experience/timeline-editor"
import { StepNavigation } from "@/components/features/simulateur/step-navigation"

export function ExperiencePageClient() {
  const days = useSimulateurStore((s) => s.days)
  const profile = useSimulateurStore((s) => s.profile)
  const data = useSimulateurData()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Check if the current program was pre-filled from a template
  const isPreFilled = useMemo(() => {
    if (!profile.templateSlug) return false
    const template = data.templates.find((t) => t.slug === profile.templateSlug)
    if (!template?.acf.programme_defaut?.length) return false
    return days.some((day) =>
      day.slots.some(
        (slot) =>
          (slot.activite_slugs?.length ?? 0) > 0 ||
          (slot.espace_slugs?.length ?? 0) > 0 ||
          (slot.service_slugs?.length ?? 0) > 0
      )
    )
  }, [profile.templateSlug, data.templates, days])

  // Validation: at least one activity must be assigned across all days
  const hasAtLeastOneActivity = useMemo(() => {
    for (const day of days) {
      for (const slot of day.slots) {
        if (
          slot.activite_slugs?.length ||
          slot.espace_slugs?.length ||
          slot.service_slugs?.length
        ) {
          return true
        }
      }
    }
    return false
  }, [days])

  const handleBeforeNext = useCallback(() => {
    if (!hasAtLeastOneActivity) return false
    return true
  }, [hasAtLeastOneActivity])

  return (
    <div className="space-y-6">
      {isPreFilled && !bannerDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#78AD7D]/30 bg-[#78AD7D]/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 text-[#78AD7D]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM9 12.75C8.5875 12.75 8.25 12.4125 8.25 12V9C8.25 8.5875 8.5875 8.25 9 8.25C9.4125 8.25 9.75 8.5875 9.75 9V12C9.75 12.4125 9.4125 12.75 9 12.75ZM9.75 6.75H8.25V5.25H9.75V6.75Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <p className="text-sm text-[#2A4A51]">
              <span className="font-semibold">Programme suggéré</span> — basé sur votre choix de
              séjour. Personnalisez-le à votre guise !
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="flex-shrink-0 text-[#2A4A51]/40 hover:text-[#2A4A51] transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
      <TimelineEditor />
      <StepNavigation
        currentStep="experience"
        canProceed={hasAtLeastOneActivity}
        onBeforeNext={handleBeforeNext}
      />
    </div>
  )
}
