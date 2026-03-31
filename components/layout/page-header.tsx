"use client"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getColorForPath, MENU_COLOR_SEQUENCE } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"

interface PageHeaderProps {
  title: string
  subtitle?: string
  image?: string
  className?: string
  color?: string
  children?: React.ReactNode
}

function getHashColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }
  return MENU_COLOR_SEQUENCE[Math.abs(hash) % MENU_COLOR_SEQUENCE.length]
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
  const menuColor = useMenuColor(pathname)

  const mainBlobColor = color || menuColor || getColorForPath(pathname) || getHashColor(title)

  return (
    <div className={`w-[calc(100%-1rem)] mt-8 mx-auto relative pt-8 ${className}`}>
      {/* ===== MOBILE : 2 lignes (logo+titre puis image) ===== */}
      <div className="md:hidden">
        {/* Ligne 1 : Logo + Titre */}
        <div className="flex items-stretch gap-2 mb-2">
          <Link
            href="/"
            className="flex-shrink-0 flex items-center justify-center rounded-2xl p-4 hover:opacity-80 transition-opacity"
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
          <motion.div
            className="flex-1 rounded-2xl flex items-center px-5 py-3"
            style={{ backgroundColor: mainBlobColor }}
            initial={{ clipPath: "inset(0 100% 0 0 round 16px)" }}
            animate={{ clipPath: "inset(0 0% 0 0 round 16px)" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          >
            <h1 className="font-sans font-bold text-sm sm:text-base text-white uppercase leading-tight drop-shadow-sm">
              {title}
            </h1>
          </motion.div>
        </div>

        {/* Ligne 2 : Image d'en-tete */}
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          style={{
            height: "clamp(120px, 25vh, 140px)",
            backgroundColor: mainBlobColor,
          }}
          initial={{ clipPath: "inset(0 100% 0 0 round 16px)" }}
          animate={{ clipPath: "inset(0 0% 0 0 round 16px)" }}
          transition={{ duration: 1.15, ease: "easeOut", delay: 0.3 }}
        >
          {image && (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              quality={80}
              priority
            />
          )}
        </motion.div>
      </div>

      {/* ===== DESKTOP : layout original avec encoches ===== */}
      <div className="hidden md:block relative" style={{ height: "clamp(160px, 35vh, 480px)" }}>
        {/* Fond image – pleine largeur */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: mainBlobColor,
          }}
          initial={{ clipPath: "inset(0 100% 0 0 round 16px)" }}
          animate={{ clipPath: "inset(0 0% 0 0 round 16px)" }}
          transition={{ duration: 1.15, ease: "easeOut", delay: 0.2 }}
          onAnimationComplete={(def) => {
            if (def === "animate") {
              const el = document.querySelector("[data-header-bg]") as HTMLElement
              if (el) el.style.clipPath = "none"
            }
          }}
          data-header-bg=""
        >
          {image && (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              quality={80}
              priority
            />
          )}
        </motion.div>

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
          <div
            className="absolute top-0 right-0 translate-x-full rotate-180"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 0%, transparent 15px, var(--background) 15px)",
            }}
          />
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
            <h1 className="font-sans md:text-lg lg:text-xl xl:text-4xl text-white leading-tight drop-shadow-sm">
              {title}
            </h1>
          </motion.div>
          <div
            className="absolute top-0 -left-[15px]"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
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
