"use client"

import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { QuoteDocument } from "@/lib/simulateur/pdf/quote-document"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { calculateBudget } from "@/lib/simulateur/pricing"

export function PdfDownloadButton() {
  const [loading, setLoading] = useState(false)
  const profile = useSimulateurStore((s) => s.profile)
  const days = useSimulateurStore((s) => s.days)
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const selectedServices = useSimulateurStore((s) => s.selectedServices)
  const selectedEspaces = useSimulateurStore((s) => s.selectedEspaces)
  const currentStep = useSimulateurStore((s) => s.currentStep)
  const data = useSimulateurData()

  const handleDownload = async () => {
    setLoading(true)
    try {
      const state = { profile, days, accommodations, selectedServices, selectedEspaces, currentStep }
      const budget = calculateBudget(state, data, data.settings)
      const blob = await pdf(<QuoteDocument state={state} data={data} budget={budget} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `devis-hermitage-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors de la g\u00e9n\u00e9ration du PDF :", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={loading} variant="outline" className="gap-2">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {loading ? "G\u00e9n\u00e9ration..." : "T\u00e9l\u00e9charger le devis PDF"}
    </Button>
  )
}
