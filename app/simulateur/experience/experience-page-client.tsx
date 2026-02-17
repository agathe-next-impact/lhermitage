"use client"

import { useMemo, useCallback } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { TimelineEditor } from "@/components/features/simulateur/experience/timeline-editor"
import { StepNavigation } from "@/components/features/simulateur/step-navigation"

export function ExperiencePageClient() {
  const days = useSimulateurStore((s) => s.days)

  // Validation: at least one activity must be assigned across all days
  const hasAtLeastOneActivity = useMemo(() => {
    for (const day of days) {
      for (const slot of day.slots) {
        if (slot.activite_slug || slot.espace_slug) {
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
      <TimelineEditor />
      <StepNavigation
        currentStep="experience"
        canProceed={hasAtLeastOneActivity}
        onBeforeNext={handleBeforeNext}
      />
    </div>
  )
}
