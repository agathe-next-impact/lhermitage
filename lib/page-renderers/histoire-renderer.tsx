import dynamic from "next/dynamic"
import type { WPPage, HistoireACF } from "@/lib/wordpress/types"

const HistoireTimeline = dynamic(() =>
  import("@/components/histoire-timeline").then((m) => m.HistoireTimeline)
)

export default function HistoireRenderer({ page }: { page: WPPage }) {
  if (!page.acf) return null
  return (
    <div className="relative z-10">
      <HistoireTimeline acf={page.acf as HistoireACF} />
    </div>
  )
}
