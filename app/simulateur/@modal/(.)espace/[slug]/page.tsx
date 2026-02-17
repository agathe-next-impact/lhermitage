import { DetailModal } from "@/components/features/simulateur/shared/detail-modal"
import { EspaceDetail } from "@/components/features/simulateur/shared/espace-detail"

export default function EspaceModalPage({ params }: { params: { slug: string } }) {
  return (
    <DetailModal>
      <EspaceDetail slug={params.slug} />
    </DetailModal>
  )
}
