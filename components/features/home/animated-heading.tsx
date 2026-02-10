"use client"

import { useRef } from "react"
import VariableProximity from "@/components/ui/variable-proximity"

interface AnimatedHeadingProps {
  children: string
  level?: "h1" | "h2" | "h3"
  className?: string
}

export function AnimatedHeading({ children, level = "h2", className = "" }: AnimatedHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const baseClasses = {
    h1: "text-4xl md:text-5xl uppercase font-extrabold",
    h2: "text-3xl text-center md:text-4xl uppercase font-extrabold",
    h3: "text-2xl md:text-3xl uppercase font-bold",
  }

  const Tag = level

  return (
    <div ref={containerRef} style={{ position: "relative" }} className="font-heading">
      <Tag className={`${baseClasses[level]} ${className}`}>
        <VariableProximity
          label={children}
          fromFontVariationSettings="'wght' 400"
          toFontVariationSettings="'wght' 900"
          containerRef={containerRef}
          radius={150}
          falloff="exponential"
        />
      </Tag>
    </div>
  )
}
