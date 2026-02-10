import { SejoursListing } from "@/components/features/sejours/sejours-listing"

export default async function NosSejoursPage() {
  return (
    <SejoursListing
      wpPath="sejours-collectifs/nos-sejours"
      routePath="/sejours-collectifs/nos-sejours"
      fallbackTitle="Nos Séjours"
      featuredIndex={0}
      emptyMessage="Aucun séjour disponible pour le moment."
    />
  )
}
