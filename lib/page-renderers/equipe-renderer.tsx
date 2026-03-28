import dynamic from "next/dynamic"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { WPPage, WPPost, TeamMemberACF } from "@/lib/wordpress/types"

const TeamMasonry = dynamic(() =>
  import("@/components/team-masonry").then((m) => m.TeamMasonry)
)

interface Props {
  page: WPPage
  extra: { teamMembers: WPPost<TeamMemberACF>[] }
}

export default function EquipeRenderer({ page, extra }: Props) {
  return (
    <div className="relative z-10 mx-auto">
      {page.content.rendered && (
        <div
          className="prose prose-stone max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
        />
      )}
      <TeamMasonry members={extra.teamMembers} />
    </div>
  )
}
