"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { DayColumn } from "./day-column"

export function TimelineEditor() {
  const days = useSimulateurStore((s) => s.days)
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  const handleDaySelect = useCallback((index: number) => {
    setActiveDayIndex(index)
  }, [])

  if (days.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Aucune journée configurée</p>
        <p className="text-sm mt-1">
          Retournez à l&apos;étape Profil pour définir la durée de votre séjour.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading uppercase font-extrabold tracking-wide text-brand-dark text-2xl mb-2">
          Composez votre programme
        </h2>
        <p className="text-muted-foreground">
          Organisez chaque journée en choisissant des activités, espaces et moments de convivialité.
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 flex-wrap">
        {days.map((day, index) => (
          <button
            key={day.dayNumber}
            type="button"
            onClick={() => handleDaySelect(index)}
            className={cn(
              "px-4 py-2 rounded-full font-heading uppercase text-xs font-bold tracking-wider transition-all duration-200",
              index === activeDayIndex
                ? "bg-[#2A4A51] text-white shadow-lg"
                : "bg-white border-2 border-border hover:border-[#2A4A51]/30"
            )}
          >
            Jour {day.dayNumber}
          </button>
        ))}
      </div>

      {/* Active day content */}
      <DayColumn dayIndex={activeDayIndex} />
    </div>
  )
}
