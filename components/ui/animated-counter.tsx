"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: string | number
  color?: string
  className?: string
  duration?: number
}

/**
 * Counter that animates from 0 → target when scrolled into view.
 * Accepts numeric values or strings with a numeric prefix (e.g. "30", "85").
 */
export function AnimatedCounter({
  value,
  color,
  className = "text-4xl md:text-5xl font-black",
  duration = 1500,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const valueStr = String(value)
  const numericMatch = valueStr.match(/^(\d+)(.*)$/)
  const target = numericMatch ? parseInt(numericMatch[1], 10) : 0
  const suffix = numericMatch ? numericMatch[2] || "" : ""
  const isNumeric = !!numericMatch
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (!isInView || !isNumeric) return

    const steps = 40
    const stepDuration = duration / steps
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      setDisplayValue(Math.round(current) + suffix)
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, isNumeric, target, suffix, duration])

  return (
    <div ref={ref} className={className} style={color ? { color } : undefined}>
      {isNumeric ? displayValue : valueStr}
    </div>
  )
}
