"use client"

import dynamic from "next/dynamic"
import type { MapPinPointData } from "@/lib/map/types"

const GuidedTour = dynamic(
  () => import("./visualizations/guided-tour").then((mod) => ({ default: mod.GuidedTour })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[600px] items-center justify-center rounded-lg border border-muted bg-muted/50"
        role="status"
        aria-label="Chargement de la visite virtuelle"
      >
        <p className="text-muted-foreground">Chargement de la visite virtuelle...</p>
      </div>
    ),
  }
)

interface GuidedTourClientProps {
  mapPinPoints: MapPinPointData[]
}

export function GuidedTourClient({ mapPinPoints }: GuidedTourClientProps) {
  return <GuidedTour mapPinPoints={mapPinPoints} />
}
