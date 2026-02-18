"use client"

import { EspaceList } from "@/components/features/simulateur/services/espace-list"
import { StepNavigation } from "@/components/features/simulateur/step-navigation"

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <EspaceList />
      <StepNavigation currentStep="services" canProceed />
    </div>
  )
}
