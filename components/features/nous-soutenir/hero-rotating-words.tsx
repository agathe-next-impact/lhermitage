"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import type { WPImage } from "@/lib/wordpress/types"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface HeroRotatingWordsProps {
  titre?: string
  motsRotatifs?: string[]
  sousTitre?: string
  image?: WPImage
  sectionColor: string
}

/**
 * Hero with a rotating set of words inside the title.
 * "DONNONS UNE PLACE À …" + animated word.
 */
export function HeroRotatingWords({
  titre,
  motsRotatifs,
  sousTitre,
  image,
  sectionColor,
}: HeroRotatingWordsProps) {
  const words = motsRotatifs && motsRotatifs.length > 0 ? motsRotatifs : []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [words.length])

  if (!titre && words.length === 0 && !sousTitre) return null

  // Mode compact : seulement les mots rotatifs (titre/sous-titre/image
  // déjà rendus dans le bento header).
  const compact = !titre && !sousTitre && !image?.url

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-brand-pink"
    >
      {image?.url && (
        <div className="absolute inset-0 opacity-25">
          <Image
            src={image.url}
            alt={image.alt || ""}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover"
          />
        </div>
      )}

      <div
        className={`relative z-10 text-center ${
          compact ? "px-6 py-8 md:px-12 md:py-12" : "px-6 py-16 md:px-16 md:py-24"
        }`}
      >
        {titre && (
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-tight">
            {titre}
          </h1>
        )}

        {words.length > 0 && (
          <div className="mt-3 md:mt-5 h-[1.2em] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="inline-block text-3xl md:text-5xl lg:text-6xl font-black uppercase text-white drop-shadow-sm"
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}

        {sousTitre && (
          <p className="mt-8 mx-auto max-w-2xl text-white/95 text-base md:text-xl uppercase tracking-wide font-semibold">
            {sousTitre}
          </p>
        )}
      </div>
    </section>
  )
}
