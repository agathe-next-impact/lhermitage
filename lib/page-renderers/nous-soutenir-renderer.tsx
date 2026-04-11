import type { WPPage, NousSoutenirACF } from "@/lib/wordpress/types"
import { NousSoutenirPage } from "@/components/features/nous-soutenir/nous-soutenir-page"

interface Props {
  page: WPPage
  extra: { nousSoutenirData: NousSoutenirACF | null }
}

export default function NousSoutenirRenderer({ page: _page, extra }: Props) {
  // Fallback empty data so the page renders even before WP admin imports the
  // matching ACF field group — sections short-circuit on missing fields.
  const data = extra.nousSoutenirData || {}
  return <NousSoutenirPage data={data} />
}
