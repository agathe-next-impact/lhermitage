import { DetailModal } from "@/components/features/simulateur/shared/detail-modal"
import { ActiviteDetail } from "@/components/features/simulateur/shared/activite-detail"

export default function ActiviteModalPage({ params }: { params: { slug: string } }) {
  return (
    <DetailModal>
      <ActiviteDetail slug={params.slug} />
    </DetailModal>
  )
}
