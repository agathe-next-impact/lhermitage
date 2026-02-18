"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { SlotCard } from "./slot-card"

interface DayColumnProps {
  dayIndex: number
}

export function DayColumn({ dayIndex }: DayColumnProps) {
  const days = useSimulateurStore((s) => s.days)

  const day = days[dayIndex]

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
    </div>
  )
}
