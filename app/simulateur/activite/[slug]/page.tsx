import { ActiviteDetail } from "@/components/features/simulateur/shared/activite-detail"

export default function ActivitePage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <ActiviteDetail slug={params.slug} />
    </div>
  )
}
