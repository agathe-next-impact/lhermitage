import { wpApi } from "@/lib/wordpress/api"
import { HomePageClient } from "@/components/features/home/home-page-client"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.homepage

export default async function HomePage() {
  const homepage = await wpApi.getHomepage()

  // Fetch data in parallel to speed up loading and handle errors individually
  const [sejours, hebergements, evenements] = await Promise.all([
    wpApi.getSejours().catch((err) => {
      console.error("Error fetching sejours:", err)
      return []
    }),
    wpApi.getHebergements().catch((err) => {
      console.error("Error fetching hebergements:", err)
      return []
    }),
    wpApi.getEvenements().catch((err) => {
      console.error("Error fetching evenements:", err)
      return []
    }),
  ])

  return (
    <>
      <HomePageClient homepage={homepage} evenements={evenements} />
    </>
  )
}
