import dynamic from "next/dynamic"
import type { WPPage, PatrimoineACF } from "@/lib/wordpress/types"

const PatrimoinePage = dynamic(() =>
  import("@/components/patrimoine-page").then((m) => m.PatrimoinePage)
)

interface Props {
  page: WPPage
  extra: { patrimoineData: PatrimoineACF | null }
}

export default function PatrimoineRenderer({ page: _page, extra }: Props) {
  if (!extra.patrimoineData?.sections) return null
  return (
    <div className="relative z-10">
      <PatrimoinePage acf={extra.patrimoineData} />
    </div>
  )
}
