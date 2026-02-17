"use client"

import { useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { Button } from "@/components/ui/button"
import { SlotCard } from "./slot-card"

interface DayColumnProps {
  dayIndex: number
}

export function DayColumn({ dayIndex }: DayColumnProps) {
  const days = useSimulateurStore((s) => s.days)
  const addSlot = useSimulateurStore((s) => s.addSlot)

  const day = days[dayIndex]

  const handleAddSlot = useCallback(() => {
    // Determine a reasonable default time for the new slot
    const slots = day?.slots ?? []
    let nextTime = "10:00"
    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1]
      const [h, m] = lastSlot.heure_debut.split(":").map(Number)
      const nextH = Math.min(h + 2, 23)
      nextTime = `${String(nextH).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    }
    addSlot(dayIndex, {
      heure_debut: nextTime,
      type_creneau: "activite",
    })
  }, [dayIndex, day?.slots, addSlot])

  if (!day) return null

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-[23px] top-4 bottom-4 w-px bg-[#2A4A51]/20 hidden md:block" />

      <AnimatePresence mode="popLayout" initial={false}>
        <div className="space-y-3">
          {day.slots.map((slot, slotIndex) => (
            <motion.div
              key={slot.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Time label on the left (desktop) */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="hidden md:flex flex-col items-center flex-shrink-0 w-[46px] pt-3">
                  <span className="text-xs font-mono text-muted-foreground">
                    {slot.heure_debut}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2A4A51] ring-4 ring-[#2A4A51]/10 mt-1 relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <SlotCard dayIndex={dayIndex} slotIndex={slotIndex} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Add slot button */}
      <div className="flex items-start gap-3 md:gap-4 mt-4">
        <div className="hidden md:block w-[46px] flex-shrink-0" />
        <Button
          variant="outline"
          onClick={handleAddSlot}
          className="w-full rounded-full border-2 border-dashed border-[#2A4A51]/30 text-[#2A4A51]/60 font-heading uppercase text-xs tracking-wider hover:border-[#2A4A51]/50 hover:text-[#2A4A51] transition-all duration-200"
        >
          + Ajouter un créneau
        </Button>
      </div>
    </div>
  )
}
