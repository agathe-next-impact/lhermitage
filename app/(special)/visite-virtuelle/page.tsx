import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/page-header"
import { GuidedTourClient } from "./guided-tour-client"

export default async function VisiteVirtuellePage() {
  console.warn("[v0] VisiteVirtuellePage - Loading page")

  let mapPinPoints = []

  try {
    mapPinPoints = await wpApi.getMapPinPoints()
    console.warn("[v0] VisiteVirtuellePage - Map pin points loaded:", mapPinPoints.length)
  } catch (error) {
    console.error("[v0] VisiteVirtuellePage - Error loading map pin points:", error)
  }

  return (
    <div>
      <PageHeader
        title="Découvrir le lieu"
        subtitle="Explorez l'Hermitage à travers un parcours virtuel immersif"
        image="/rural-retreat-landscape.jpg"
      />

      <div className="container mx-auto px-4 py-12">
        <GuidedTourClient mapPinPoints={mapPinPoints} />
      </div>
    </div>
  )
}
