import { wpApi } from "@/lib/wordpress/api"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
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
    <div>
      <PageHeader
        title="Découvrir le lieu"
        subtitle="Explorez l'Hermitage à travers un parcours virtuel immersif"
        image="/ciel.jpg"
      />
      <BentoHeaderContent title="Survolez le domaine">
        <div className="container mx-auto p-2">
          <GuidedTourClient mapPinPoints={mapPinPoints} />
        </div>
      </BentoHeaderContent>
    </div>
  )
}
