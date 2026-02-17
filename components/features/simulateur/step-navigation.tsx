"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { STEPS } from "@/lib/simulateur/constants"
import { useSimulateurStore } from "@/lib/simulateur/store"
import type { SimulateurStep } from "@/lib/simulateur/types"

interface StepNavigationProps {
  currentStep: SimulateurStep
  canProceed?: boolean
  onBeforeNext?: () => boolean | void
}

export function StepNavigation({
  currentStep,
  canProceed = true,
  onBeforeNext,
}: StepNavigationProps) {
  const router = useRouter()
  const setStep = useSimulateurStore((s) => s.setStep)

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)
  const prevStep = currentIndex > 0 ? STEPS[currentIndex - 1] : null
  const nextStep = currentIndex < STEPS.length - 1 ? STEPS[currentIndex + 1] : null

  const handleNext = () => {
    if (onBeforeNext) {
      const result = onBeforeNext()
      if (result === false) return
    }
    if (nextStep) {
      setStep(nextStep.key)
      router.push(nextStep.path)
    }
  }

  const handlePrev = () => {
    if (prevStep) {
      setStep(prevStep.key)
      router.push(prevStep.path)
    }
  }

  return (
    <div className="flex items-center justify-between pt-12">
      {prevStep ? (
        <Button
          variant="outline"
          onClick={handlePrev}
          className="rounded-full px-8 border-2 border-[#2A4A51] text-[#2A4A51] font-heading uppercase font-bold tracking-wider text-sm hover:bg-[#2A4A51]/5"
        >
          ← {prevStep.label}
        </Button>
      ) : (
        <div />
      )}
      {nextStep && (
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="rounded-full px-8 bg-[#2A4A51] hover:bg-[#2A4A51]/90 text-white font-heading uppercase font-bold tracking-wider text-sm"
        >
          {nextStep.label} →
        </Button>
      )}
    </div>
  )
}
