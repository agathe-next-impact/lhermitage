"use client"

import Image from "next/image"
import { Timeline } from "@/components/ui/timeline"
import type { HistoireACF } from "@/lib/wordpress/types"
import { decodeHtmlEntities } from "@/lib/wordpress/decode"

interface HistoireTimelineProps {
  acf: HistoireACF
}

export function HistoireTimeline({ acf }: HistoireTimelineProps) {
  console.log("[v0] HistoireTimeline - acf:", acf)
  console.log("[v0] HistoireTimeline - acf.timeline:", acf.timeline)

  if (!acf.timeline || acf.timeline.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Aucun élément d'historique trouvé</h3>
          <p className="text-muted-foreground">La timeline de l'historique n'a pas pu être chargée.</p>
        </div>
      </div>
    )
  }

  const timelineData = acf.timeline.map((item) => ({
    title: item.annee || "",
    content: (
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        {item.image && (
          <div className="relative h-[200px] w-full md:h-[300px]">
            <Image
              src={item.image.url || "/placeholder.svg"}
              alt={item.image.alt || item.titre || "Image historique"}
              fill
              className="h-full object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              quality={80}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}
        <div className="p-4 md:p-8">
          {item.titre && (
            <h4 className="mb-3 text-lg font-bold text-[#E75754] md:mb-4 md:text-3xl">
              {decodeHtmlEntities(item.titre)}
            </h4>
          )}
          {item.descriptif && (
            <div
              className="prose prose-stone max-w-none text-xs text-gray-700 md:text-base [&>p]:mb-2 md:[&>p]:mb-4 [&>ul]:mb-2 md:[&>ul]:mb-4 [&>ol]:mb-2 md:[&>ol]:mb-4"
              dangerouslySetInnerHTML={{ __html: item.descriptif }}
            />
          )}
        </div>
      </div>
    ),
  }))

  return <Timeline data={timelineData} />
}
