import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { GuidedTourClient } from "./guided-tour-client"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.listing

export default async function VisiteVirtuellePage() {
  let mapPinPoints: Awaited<ReturnType<typeof wpApi.getMapPinPoints>> = []

  try {
    mapPinPoints = await wpApi.getMapPinPoints()
  } catch (error) {
    // Silently handle error - empty array fallback
  }

  return (
    <PageHeader
      title="Découvrir le lieu"
      subtitle="Explorez l'Hermitage à travers un parcours virtuel immersif"
      image="/rural-retreat-landscape.jpg"
    >

      <div className="relative z-10 container mx-auto px-4 py-12">
        <GuidedTourClient mapPinPoints={mapPinPoints} />
      </div>
    </PageHeader>
  )
}
