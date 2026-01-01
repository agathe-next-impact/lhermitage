import { wpApi } from "@/lib/wordpress/api"
import { HomePageClient } from "@/components/home-page-client"

export const revalidate = 7200

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

  return <HomePageClient homepage={homepage} sejours={sejours} hebergements={hebergements} evenements={evenements} />
}

function getYouTubeEmbedUrl(oembedUrl: string): string | null {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = oembedUrl.match(pattern)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&autohide=1`
    }
  }

  return null
}

export { getYouTubeEmbedUrl }
