import { HebergementDetail } from "@/components/features/simulateur/shared/hebergement-detail"

export default function HebergementPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <HebergementDetail slug={params.slug} />
    </div>
  )
}
