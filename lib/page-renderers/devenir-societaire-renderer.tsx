import type { WPPage } from "@/lib/wordpress/types"
import { DevenirSocietairePage } from "@/components/features/devenir-societaire/devenir-societaire-page"

export default function DevenirSocietaireRenderer({ page }: { page: WPPage }) {
  return <DevenirSocietairePage page={page} />
}
