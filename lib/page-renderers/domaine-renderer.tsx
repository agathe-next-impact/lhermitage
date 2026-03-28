import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import type { WPPage } from "@/lib/wordpress/types"

interface Props {
  page: WPPage
  extra: { domaineVideo: { url: string; mimeType: string; descriptif?: string } | null }
}

export default function DomaineRenderer({ page: _page, extra }: Props) {
  const { domaineVideo } = extra
  return (
    <div className="relative z-10 mx-auto space-y-2 pt-2 pl-2">
      {domaineVideo && (
        <div className="container mx-auto">
          <div className="overflow-hidden rounded-xl">
            <video
              src={domaineVideo.url}
              controls
              playsInline
              className="w-full"
              autoPlay
              muted
              loop
            >
              <source src={domaineVideo.url} type={domaineVideo.mimeType} />
            </video>
          </div>
        </div>
      )}
      {domaineVideo?.descriptif && (
        <div
          className="prose text-brand-dark max-w-none mb-6 md:p-4 bg-white rounded-2xl"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(domaineVideo.descriptif) }}
        />
      )}
    </div>
  )
}
