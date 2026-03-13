"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { getColorForPath, MENU_COLOR_SEQUENCE } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"

interface BentoHeaderContentProps {
  title?: string
  subtitle?: string
  columnImage?: string
  className?: string
  color?: string
  children?: ReactNode
}

function getHashColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }
  return MENU_COLOR_SEQUENCE[Math.abs(hash) % MENU_COLOR_SEQUENCE.length]
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
  const lBlockRef = useRef<HTMLDivElement>(null)
  const menuColor = useMenuColor(pathname)
  const mainBlobColor =
    color || menuColor || getColorForPath(pathname) || getHashColor(title || pathname)

  return (
    <div className={`w-[calc(100%-1rem)] mt-2 mx-auto relative overflow-visible ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 overflow-visible">
        {/* Bloc L continu — un seul élément croppé par overlay */}
        <motion.div
          ref={lBlockRef}
          className="col-span-1 md:col-span-4 relative rounded-xl overflow-hidden border-b-2 border-background md:h-[calc(clamp(80px,35vh,160px)+9rem)]"
          style={{
            backgroundColor: mainBlobColor,
          }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          onAnimationComplete={() => {
            lBlockRef.current?.style.removeProperty("clip-path")
          }}
        >
          {/* Logo — flow sur mobile, absolute sur md+ */}
          <div className="p-4 md:absolute md:bottom-20 md:left-6 md:p-0 md:w-24 md:h-full z-10">
            <Image
              src="/logo-arcs-light.png"
              alt={title || "L'Hermitage"}
              width={100}
              height={100}
              quality={100}
              className="w-12 md:w-24 h-auto md:h-full object-contain"
            />
          </div>

          {/* Overlay — masque le bas-droit pour former le L (desktop) */}
          <div
            className="hidden md:block absolute right-0 bottom-0 bg-background rounded-tl-[15px] pointer-events-none"
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

          {/* Titre en bas-gauche du L — flow sur mobile, absolute sur md+ */}
          {title && (
            <div className="relative md:absolute md:bottom-0 md:left-0 w-full md:w-1/4 md:h-36 px-4 pb-4 md:p-6 flex flex-col justify-end">
              <h2 className="font-sans text-2xl sm:text-3xl md:text-xl lg:text-3xl text-white leading-tight drop-shadow-sm">
                {title}
              </h2>
              {subtitle && <p className="text-xs md:text-sm text-white/80 mt-2">{subtitle}</p>}
            </div>
          )}
        </motion.div>

        {/* Image colonne 1 — occupe la hauteur restante sous le bloc L */}
        {columnImage && (
          <div className="hidden md:block col-span-1 relative rounded-[15px] overflow-hidden mt-2">
            <Image
              src={columnImage}
              alt={title || "L'Hermitage"}
              width={400}
              height={400}
              quality={100}
              className="absolute inset-0 h-full w-full object-cover rounded-xl"
            />
          </div>
        )}

        {/* Contenu de page — colonnes 2-4 (ou décalé si pas d'image) */}
        <div
          className={`col-span-1 rounded-xl ${columnImage ? "md:col-span-3" : "md:col-start-2 md:col-span-3"} md:-mt-40 pt-3 relative z-10 [&>div]:px-0 [&>div]:md:px-4`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
