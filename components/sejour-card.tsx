import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { WPPost, SejourACF } from "@/lib/wordpress/types"

interface SejourCardProps {
  sejour: WPPost<SejourACF>
}

export function SejourCard({ sejour }: SejourCardProps) {
  return (
    <Link href={`/sejour/${sejour.slug}`} className="block group">
      <div className="relative h-[320px] w-full overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        {/* Image de fond qui prend toute la hauteur */}
        {sejour._embedded?.["wp:featuredmedia"]?.[0] && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={sejour._embedded["wp:featuredmedia"][0].source_url || "/placeholder.svg"}
              alt={sejour._embedded["wp:featuredmedia"][0].alt_text || sejour.title.rendered}
              fill
              className="object-cover"
              quality={70}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQFESExBhJBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Am8gF8fiYZppJIxJcSMXaRyWJIA5J5NVvG8tcXEomMkgkRA25J2T1xSlB/9k="
            />
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md rounded-t-2xl p-6 transform translate-y-[calc(100%-100px)] transition-transform duration-700 ease-out group-hover:translate-y-0 z-20 h-full flex flex-col">
          {/* Titre toujours visible */}
          <div className="flex-shrink-0">
            <h3 className="text-2xl font-bold text-[#56939F] line-clamp-3">
              {sejour.acf?.nom || sejour.title.rendered}
            </h3>
          </div>

          {/* Spacer pour pousser le bouton vers le bas */}
          <div className="flex-grow" />

          {/* Bouton ancré en bas qui apparaît au hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4 flex-shrink-0">
            <Button className="w-full rounded-full bg-[#C14C66] text-white hover:bg-[#C14C66]/90 transition-colors">
              Découvrir
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
