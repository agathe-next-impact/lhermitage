import { DetailModal } from "@/components/features/simulateur/shared/detail-modal"
import { HebergementDetail } from "@/components/features/simulateur/shared/hebergement-detail"

export default function HebergementModalPage({ params }: { params: { slug: string } }) {
  return (
    <DetailModal>
      <HebergementDetail slug={params.slug} />
    </DetailModal>
  )
}
