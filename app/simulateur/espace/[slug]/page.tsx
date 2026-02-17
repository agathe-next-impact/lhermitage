import { EspaceDetail } from "@/components/features/simulateur/shared/espace-detail"

export default function EspacePage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <EspaceDetail slug={params.slug} />
    </div>
  )
}
