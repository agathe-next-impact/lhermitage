"use client"

import { useEffect, useRef } from "react"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { ServiceList } from "@/components/features/simulateur/services/service-list"
import { StepNavigation } from "@/components/features/simulateur/step-navigation"

export default function ServicesPage() {
  const data = useSimulateurData()
  const initialized = useRef(false)

  // Auto-select services that are included by default (runs once on mount)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const { selectedServices, toggleService } = useSimulateurStore.getState()

    const inclusServices = data.services.filter((s) => s.acf.inclus_par_defaut === true)

    for (const service of inclusServices) {
      const alreadySelected = selectedServices.some((ss) => ss.service_slug === service.slug)
      if (!alreadySelected) {
        toggleService(service.slug)
      }
    }
  }, [data.services])

  return (
    <div className="space-y-6">
      <ServiceList />
      <StepNavigation currentStep="services" canProceed />
    </div>
  )
}
