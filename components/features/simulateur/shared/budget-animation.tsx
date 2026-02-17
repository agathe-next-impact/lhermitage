"use client"

import { useEffect, useRef, useState } from "react"

interface BudgetAnimationProps {
  value: number
  duration?: number
  className?: string
}

export function BudgetAnimation({ value, duration = 600, className }: BudgetAnimationProps) {
  const [display, setDisplay] = useState(value)
  const prevValue = useRef(value)
  const rafRef = useRef<number>()

  useEffect(() => {
    const from = prevValue.current
    const to = value
    prevValue.current = to

    if (from === to) return

    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return <span className={className}>{display.toLocaleString("fr-FR")}</span>
}
