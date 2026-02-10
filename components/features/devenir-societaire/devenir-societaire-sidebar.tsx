"use client"

import Image from "next/image"

interface ImageItem {
  url: string
  alt: string
}

interface DevenirSocietaireSidebarProps {
  images?: ImageItem[]
}

export function DevenirSocietaireSidebar({ images = [] }: DevenirSocietaireSidebarProps) {
  if (!images || images.length === 0) return null

  return (
    <aside className="sticky top-20 h-fit space-y-4">
      {images.map((image, idx) => (
        <div
          key={idx}
          className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          <Image
            src={image.url || "/placeholder.svg"}
            alt={image.alt || `Image ${idx + 1}`}
            width={300}
            height={300}
            className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            quality={90}
          />
        </div>
      ))}
    </aside>
  )
}
