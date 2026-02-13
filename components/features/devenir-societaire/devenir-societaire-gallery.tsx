"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface GalleryImage {
  id: string
  url: string
  alt?: string
}

interface DevenirSocietaireGalleryProps {
  images: GalleryImage[]
}

export function DevenirSocietaireGallery({ images }: DevenirSocietaireGalleryProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  }

  const hoverVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  }

  if (!images || images.length === 0) return null

  // Create masonry layout - alternate heights for visual interest
  const getMasonryClass = (index: number) => {
    // Use only the images we have, don't repeat pattern
    const heights = ["row-span-1", "row-span-2", "row-span-1"]
    return heights[index % Math.min(heights.length, images.length)]
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[250px] mt-6 ml-4"
    >
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          variants={itemVariants}
          whileHover="hover"
          className={`relative overflow-hidden rounded-lg shadow-md ${getMasonryClass(index)}`}
        >
          <motion.div variants={hoverVariants} className="w-full h-full">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt || `Gallery image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}
