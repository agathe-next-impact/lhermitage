"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { NarrativeSummary } from "@/components/features/simulateur/recapitulatif/narrative-summary"
import { BudgetTable } from "@/components/features/simulateur/recapitulatif/budget-table"
import { QuoteForm } from "@/components/features/simulateur/recapitulatif/quote-form"
import { StepNavigation } from "@/components/features/simulateur/step-navigation"
import { useSimulateurStore } from "@/lib/simulateur/store"

const PdfDownloadButton = dynamic(
  () =>
    import("@/components/features/simulateur/recapitulatif/pdf-download-button").then(
      (m) => m.PdfDownloadButton
    ),
  {
    ssr: false,
    loading: () => <span className="text-sm text-muted-foreground">Chargement PDF...</span>,
  }
)

export function RecapitulatifContent() {
  const setStep = useSimulateurStore((s) => s.setStep)

  // Ensure the store is synced when we land on this page
  useEffect(() => {
    setStep("recapitulatif")
  }, [setStep])

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <NarrativeSummary />

      <BudgetTable />

      <div className="flex items-center gap-3">
        <PdfDownloadButton />
      </div>

      <div className="h-px bg-border" />

      <QuoteForm />

      <StepNavigation currentStep="recapitulatif" />
    </div>
  )
}
