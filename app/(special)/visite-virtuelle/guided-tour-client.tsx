"use client"

import dynamic from "next/dynamic"

interface MapPinPointData {
  id: number
  type: string
  title: string
  slug: string
  link: string
  mapPinPoint: {
    visibilite: boolean
    nom?: string
    images?: Array<{ url: string; alt: string }>
    descriptif?: string
    lien?: string | { url: string; title: string }
    position?: {
      latitude: number
      longitude: number
      altitude: number
    }
  }
}

const GuidedTour = dynamic(() => import("./visualizations/guided-tour").then((mod) => ({ default: mod.GuidedTour })), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg border border-muted bg-muted/50">
      <p className="text-muted-foreground">Chargement de la visite virtuelle...</p>
    </div>
  ),
})

interface GuidedTourClientProps {
  mapPinPoints: MapPinPointData[]
}

export function GuidedTourClient({ mapPinPoints }: GuidedTourClientProps) {
  console.log("[v0] GuidedTourClient - Received map pin points:", mapPinPoints.length)

  return <GuidedTour mapPinPoints={mapPinPoints} />
}
