"use client"

import { cn } from "@/lib/utils"

interface CapacityBarProps {
  current: number
  target: number
}

export function CapacityBar({ current, target }: CapacityBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const isFull = current >= target
  const isPartial = current > 0 && current < target
  const isEmpty = current === 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-heading uppercase text-xs tracking-wider font-bold">
          Capacité d&apos;hébergement
        </span>
        <span
          className={cn(
            "font-bold tabular-nums",
            isFull && "text-emerald-600",
            isPartial && "text-amber-500",
            isEmpty && "text-red-500"
          )}
        >
          {current} / {target} personnes logées
        </span>
      </div>

      <div className="rounded-full h-3 bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isFull && "bg-gradient-to-r from-[#78AD7D] to-[#56939F]",
            isPartial && "bg-gradient-to-r from-[#DC6F45] to-[#E75754]",
            isEmpty && "bg-gradient-to-r from-[#C14C66] to-[#E75754]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isFull && (
        <p className="text-xs text-emerald-600 font-medium">Tous les participants sont logés.</p>
      )}
      {isPartial && (
        <p className="text-xs text-amber-500">
          Encore {target - current} place{target - current > 1 ? "s" : ""} à pourvoir.
        </p>
      )}
      {isEmpty && target > 0 && (
        <p className="text-xs text-red-500">
          Sélectionnez des hébergements pour loger vos {target} participants.
        </p>
      )}
    </div>
  )
}
