import { SejoursListing } from "@/components/features/sejours/sejours-listing"

export default async function PacksDeSejoursPage() {
  return (
    <SejoursListing
      wpPath="sejours-collectifs/packs-de-sejours"
      routePath="/sejours-collectifs/packs-de-sejours"
      fallbackTitle="Packs de Séjours"
      featuredIndex={1}
      emptyMessage="Aucun pack de séjour disponible pour le moment."
    />
  )
}
