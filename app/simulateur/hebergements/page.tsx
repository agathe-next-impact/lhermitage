"use client"

import { useMemo } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { HebergementPicker } from "@/components/features/simulateur/hebergements/hebergement-picker"
import { StepNavigation } from "@/components/features/simulateur/step-navigation"

export default function HebergementsPage() {
  const data = useSimulateurData()
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const groupSize = useSimulateurStore((s) => s.profile.groupSize)

  const totalCapacity = useMemo(() => {
    return accommodations.reduce((sum, acc) => {
      const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
      if (!heb) return sum
      return sum + (heb.acf.capacite_personnes ?? 0) * acc.quantity
    }, 0)
  }, [accommodations, data.hebergements])

  const canProceed = totalCapacity >= groupSize

  return (
    <div className="space-y-6">
      <HebergementPicker />
      <StepNavigation currentStep="hebergements" canProceed={canProceed} />
    </div>
  )
}
