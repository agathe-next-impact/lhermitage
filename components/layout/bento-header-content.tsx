"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useMemo, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { getColorForPath } from "@/lib/page-colors"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface BentoHeaderContentProps {
  title: string
  subtitle?: string
  columnImage?: string
  className?: string
  color?: string
  children?: ReactNode
}

const brandColors = [
  BRAND_COLORS.coral,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
]

function getMainBlobColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }
  return brandColors[Math.abs(hash) % brandColors.length]
}

export function BentoHeaderContent({
  title,
  subtitle,
  columnImage,
  className = "",
  color,
  children,
}: BentoHeaderContentProps) {
  const pathname = usePathname()
  const mainBlobColor = useMemo(() => {
    if (color) return color
    return getColorForPath(pathname) || getMainBlobColor(title)
  }, [pathname, color, title])

  return (
    <div className={`w-[calc(100%-1rem)] mt-2 mx-auto relative ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Bloc L continu — un seul élément croppé par overlay */}
        <motion.div
          className="col-span-1 md:col-span-4 relative rounded-[15px] overflow-hidden"
          style={{ height: "calc(clamp(160px, 35vh, 80px) + 9rem)" }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        >
          <Image
            src="/logo-arcs-light.png"
            alt={title}
            width={100}
            height={100}
            quality={100}
            className="absolute bottom-20 left-6 w-24 h-full object-contain z-10"
          />
          {/* Fond coloré continu */}
          <div className="absolute inset-0" style={{ backgroundColor: mainBlobColor }} />

          {/* Overlay — masque le bas-droit pour former le L (desktop) */}
          <div
            className="hidden md:block absolute right-0 bottom-0 bg-background rounded-tl-[15px]"
            style={{ width: "75%", height: "9rem" }}
          />

          {/* Arrondi bas-droit de la 1re ligne (bord droit du bandeau) */}
          <div
            className="hidden md:block absolute right-0 w-[15px] h-[15px] pointer-events-none"
            style={{
              bottom: "9rem",
              background:
                "radial-gradient(circle at 0% 0%, transparent 15px, var(--background) 15px)",
            }}
          />

          {/* Arrondi bas-droit de la 2e ligne (pied du L) */}
          <div
            className="hidden md:block absolute bottom-0 w-[15px] h-[15px] pointer-events-none"
            style={{
              left: "calc(25% - 15px)",
              background:
                "radial-gradient(circle at 0% 0%, transparent 15px, var(--background) 15px)",
            }}
          />

          {/* Titre en bas-gauche du L */}
          <div className="absolute bottom-0 left-0 w-full md:w-1/4 h-36 p-4 md:p-6 flex flex-col justify-end">
            <h1 className="font-sans sm:text-lg md:text-xl lg:text-3xl font-extrabold uppercase text-white leading-tight drop-shadow-sm">
              {title}
            </h1>
            {subtitle && <p className="text-xs md:text-sm text-white/80 mt-2">{subtitle}</p>}
          </div>
        </motion.div>

        {/* Image colonne 1 — occupe la hauteur restante sous le bloc L */}
        {columnImage && (
          <div className="hidden md:block col-span-1 relative rounded-[15px] overflow-hidden mt-2">
            <Image
              src={columnImage}
              alt={title}
              width={400}
              height={400}
              quality={100}
              className="absolute inset-0 h-full w-full object-cover rounded-xl"
            />
          </div>
        )}

        {/* Contenu de page — colonnes 2-4 (ou décalé si pas d'image) */}
        <div
          className={`col-span-1 ${columnImage ? "md:col-span-3" : "md:col-start-2 md:col-span-3"} md:-mt-36 relative`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
