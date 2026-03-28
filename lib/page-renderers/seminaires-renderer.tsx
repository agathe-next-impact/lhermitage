import dynamic from "next/dynamic"
import type { SeminairesACF } from "@/lib/wordpress/types"

const SeminairesPage = dynamic(() =>
  import("@/components/seminaires-page").then((m) => m.SeminairesPage)
)

interface Props {
  extra: { seminairesData: SeminairesACF }
}

export default function SeminairesRenderer({ extra }: Props) {
  return (
    <div className="relative z-10">
      <SeminairesPage acf={extra.seminairesData} />
    </div>
  )
}
