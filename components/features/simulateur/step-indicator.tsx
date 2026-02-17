"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { STEPS } from "@/lib/simulateur/constants"

export function StepIndicator() {
  const pathname = usePathname()
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path))

  return (
    <nav
      aria-label="Étapes du simulateur"
      className="w-full bg-white/80 backdrop-blur-sm rounded-xl border p-3 shadow-sm"
    >
      <ol className="flex items-center gap-2 overflow-x-auto">
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isAccessible = index <= currentIndex

          return (
            <li key={step.key} className="flex items-center gap-2 shrink-0">
              {index > 0 && (
                <div
                  className={cn(
                    "w-6 md:w-10 h-0.5 transition-colors rounded-full",
                    isCompleted ? "bg-brand-coral" : "bg-border"
                  )}
                />
              )}
              {isAccessible ? (
                <Link
                  href={step.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#2A4A51] text-white"
                      : isCompleted
                        ? "bg-brand-coral/10 text-brand-coral hover:bg-brand-coral/20"
                        : "text-muted-foreground"
                  )}
                >
                  <span className="font-heading uppercase text-xs font-bold tracking-wider">
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <span className="hidden md:inline font-heading uppercase text-xs font-bold tracking-wider">
                    {step.label}
                  </span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground/50 cursor-not-allowed">
                  <span className="font-heading uppercase text-xs font-bold tracking-wider">
                    {index + 1}
                  </span>
                  <span className="hidden md:inline font-heading uppercase text-xs font-bold tracking-wider">
                    {step.label}
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
