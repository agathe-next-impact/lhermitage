"use client"

import { useEffect, useRef, type RefObject } from "react"

interface VariableProximityProps {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  containerRef: RefObject<HTMLElement>
  radius: number
  falloff?: "linear" | "exponential"
}

export default function VariableProximity({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  containerRef,
  radius,
  falloff = "linear",
}: VariableProximityProps) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const span = spanRef.current

    if (!container || !span) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = span.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )

      let proximity = 0
      if (distance < radius) {
        if (falloff === "linear") {
          proximity = 1 - distance / radius
        } else {
          // Exponential falloff
          proximity = Math.pow(1 - distance / radius, 2)
        }
      }

      // Interpolate between from and to font variation settings
      const fromWeight = parseInt(fromFontVariationSettings.match(/\d+/)?.[0] || "400")
      const toWeight = parseInt(toFontVariationSettings.match(/\d+/)?.[0] || "900")
      const currentWeight = Math.round(fromWeight + (toWeight - fromWeight) * proximity)

      span.style.fontVariationSettings = `'wght' ${currentWeight}`
    }

    container.addEventListener("mousemove", handleMouseMove)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [containerRef, radius, fromFontVariationSettings, toFontVariationSettings, falloff])

  return (
    <span
      ref={spanRef}
      style={{
        fontVariationSettings: fromFontVariationSettings,
        transition: "font-variation-settings 0.1s ease",
      }}
    >
      {label}
    </span>
  )
}
