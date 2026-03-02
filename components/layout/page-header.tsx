"use client"
import { motion } from "framer-motion"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getColorForPath } from "@/lib/page-colors"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface PageHeaderProps {
  title: string
  subtitle?: string
  image?: string
  className?: string
  color?: string
  children?: React.ReactNode
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

export function PageHeader({
  title,
  subtitle,
  image,
  className = "",
  color,
  children,
}: PageHeaderProps) {
  const pathname = usePathname()
  const colorFromPath = useMemo(() => {
    if (color) return color
    return getColorForPath(pathname)
  }, [pathname, color])

  const mainBlobColor = colorFromPath || getMainBlobColor(title)

  return (
    <div className={`w-[calc(100%-1rem)] mt-3 mx-auto relative pt-16 ${className}`}>
      {/* Container principal */}
      <div className="relative" style={{ height: "clamp(160px, 35vh, 480px)" }}>
        {/* Fond image – pleine largeur */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: mainBlobColor,
            ...(image && {
              backgroundImage: `url(${image})`,
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }),
          }}
          initial={{ clipPath: "inset(0 100% 0 0 round 16px)" }}
          animate={{ clipPath: "inset(0 0% 0 0 round 16px)" }}
          transition={{ duration: 1.15, ease: "easeOut", delay: 0.2 }}
          onAnimationComplete={(def) => {
            // Retire le clipPath après l'animation pour laisser border-radius agir
            if (def === "animate") {
              const el = document.querySelector("[data-header-bg]") as HTMLElement
              if (el) el.style.clipPath = "none"
            }
          }}
          data-header-bg=""
        />

        {/* Encoche logo – haut gauche */}
        <div className="absolute top-0 left-0 z-10 bg-background pr-2 pb-2 rounded-br-2xl">
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl p-4 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: mainBlobColor }}
          >
            <Image
              src="/logo-arcs-light.png"
              alt="Retour à l'accueil"
              width={36}
              height={36}
              className="object-contain"
            />
          </Link>
          {/* Arrondi convexe – droite de l'encoche logo */}
          <div
            className="absolute top-0 right-0 translate-x-full rotate-180"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 0%, transparent 15px, var(--background) 15px)",
            }}
          />
          {/* Arrondi convexe – bas de l'encoche logo */}
          <div
            className="absolute bottom-0 left-0 translate-y-full rotate-180"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 0%, transparent 15px, var(--background) 15px)",
            }}
          />
        </div>

        {/* Encoche titre – haut droite */}
        <div className="absolute top-0 right-0 z-10 bg-background pl-2 pb-2 rounded-bl-2xl h-1/2 flex items-end">
          <motion.div
            className="h-full w-full rounded-2xl flex items-end p-3 md:p-5"
            style={{ backgroundColor: mainBlobColor }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="font-sans text-xs sm:text-sm md:text-lg lg:text-xl xl:text-4xl font-extrabold uppercase text-white leading-tight drop-shadow-sm">
              {title}
            </h1>
          </motion.div>
          {/* Arrondi convexe – gauche de l'encoche titre */}
          <div
            className="absolute top-0 -left-[15px]"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
          {/* Arrondi convexe – bas droite */}
          <div
            className="absolute bottom-0 right-0 translate-y-full"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
        </div>
      </div>

      {children}
    </div>
  )
}

export default PageHeader
