import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/page-header"
import { GuidedTourClient } from "./guided-tour-client"

export const revalidate = 3600 // Revalidate every hour

export default async function VisiteVirtuellePage() {
  let mapPinPoints = []

  try {
    mapPinPoints = await wpApi.getMapPinPoints()
  } catch (error) {
    // Silently handle error - empty array fallback
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
