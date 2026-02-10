"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface GalleryImage {
  id: string
  url: string
  alt?: string
}

interface DevenirSocietaireSlideshowProps {
  images: GalleryImage[]
  autoplayInterval?: number
}

export function DevenirSocietaireSlideshow({ images, autoplayInterval = 4000 }: DevenirSocietaireSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [images, autoplayInterval])

  if (!images || images.length === 0) return null

  return (
    <div className="relative w-full md:w-[200px] aspect-square md:max-h-[200px] md:max-w-[200px] rounded-lg overflow-hidden bg-[#E75754]">
      {/* White arc decorative element like page title badge */}
      <div className="absolute -right-8 top-4 opacity-30 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 0C77.614 0 100 22.386 100 50C100 77.614 77.614 100 50 100"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex].url || "/placeholder.svg"}
            alt={images[currentIndex].alt || `Slide ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 200px"
            priority={currentIndex === 0}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
