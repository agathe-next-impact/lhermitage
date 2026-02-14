"use client"
import { motion } from "framer-motion"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { getColorForPath } from "@/lib/page-colors"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface PageHeaderProps {
  title: string
  subtitle?: string
  image?: string
  className?: string
  color?: string
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

export function PageHeader({ title, subtitle, image, className = "", color }: PageHeaderProps) {
  const pathname = usePathname()
  const colorFromPath = useMemo(() => {
    if (color) return color
    return getColorForPath(pathname)
  }, [pathname, color])

  const mainBlobColor = colorFromPath || getMainBlobColor(title)

  return (
    <div className={`w-[calc(100%-1rem)] mt-3 mx-auto relative pt-16 ${className}`}>
      {/* Bento grid 4 colonnes × 3 lignes */}
      <div
        className="grid grid-cols-4 grid-rows-2 relative"
        style={{ height: "clamp(160px, 35vh, 480px)" }}
      >
        {/* Fond image : couvre toute la grille, reveal latéral */}
        <motion.div
          className="col-start-1 col-end-5 row-start-1 row-end-3 relative overflow-hidden"
          style={{
            borderRadius: "15px",
            backgroundColor: mainBlobColor,
            ...(image && {
              backgroundImage: `url(${image})`,
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }),
          }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.15, ease: "easeOut", delay: 0.2 }}
        />

        {/* Encoche titre : col 4, ligne 1 (mobile: cols 3-4) */}
        <div className="col-start-3 md:col-start-4 col-end-5 row-start-1 row-end-2 z-10 bg-background relative flex items-end pb-2 pl-2 rounded-bl-2xl">
          <motion.div
            className="h-full w-full rounded-lg flex items-end p-3 md:p-5"
            style={{ backgroundColor: mainBlobColor }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div>
              <h1 className="font-sans text-xs sm:text-sm md:text-lg lg:text-xl xl:text-4xl font-extrabold uppercase text-white leading-tight drop-shadow-sm">
                {title}
              </h1>
            </div>
          </motion.div>
          {/* Arrondi convexe – haut gauche de l'encoche */}
          <div
            className="absolute top-0 -left-[15px]"
            style={{
              width: "15px",
              height: "15px",
              background: "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
          {/* Arrondi convexe – bas droite, transition vers ligne 2 */}
          <div
            className="absolute bottom-0 right-0 translate-y-full"
            style={{
              width: "15px",
              height: "15px",
              background: "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
        </div>
      </div>
      <div
        className="relative z-10 mx-auto my-2 px-4 py-2 rounded-xl py-8"
        style={{ backgroundColor: mainBlobColor }}
      >
        {subtitle && (
          <p className="text-xl text-center text-white mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default PageHeader
