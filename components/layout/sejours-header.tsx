"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getColorForPath, MENU_COLOR_SEQUENCE } from "@/lib/page-colors"
import { useMenuColor } from "@/components/menu-colors-provider"

interface SejoursHeaderProps {
  title: string
  video?: { url: string; mime_type?: string } | null
  image?: { url: string; alt?: string } | null
  accroche?: string
  sousTitre?: string
  ctaTexte?: string
  ctaLien?: { url: string; target?: string } | null
  color?: string
}

function getHashColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }
  return MENU_COLOR_SEQUENCE[Math.abs(hash) % MENU_COLOR_SEQUENCE.length]
}

export function SejoursHeader({
  title,
  video,
  image,
  accroche,
  sousTitre,
  ctaTexte,
  ctaLien,
  color,
}: SejoursHeaderProps) {
  const pathname = usePathname()
  const menuColor = useMenuColor(pathname)
  const mainBlobColor = color || menuColor || getColorForPath(pathname) || getHashColor(title)

  const videoOrImage = video?.url ? (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={image?.url}
      className="absolute inset-0 w-full h-full object-cover z-0"
    >
      <source src={video.url} type={video.mime_type || "video/mp4"} />
    </video>
  ) : image?.url ? (
    <Image
      src={image.url}
      alt={image.alt || ""}
      fill
      className="object-cover z-0"
      priority
      quality={90}
    />
  ) : (
    <div className="absolute inset-0" style={{ backgroundColor: mainBlobColor }} />
  )

  return (
    <div className="w-[calc(100%-1rem)] mt-3 mx-auto relative pt-10">
      {/* ====== MOBILE / TABLET ====== */}
      <section className="lg:hidden flex flex-col">
        {/* Ligne 1 : Logo + Titre côte à côte */}
        <div className="flex gap-2 items-stretch">
          <Link
            href="/"
            className="flex-shrink-0 flex items-center justify-center rounded-2xl p-3 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: mainBlobColor }}
          >
            <Image
              src="/logo-arcs-light.png"
              alt="Retour à l'accueil"
              width={32}
              height={32}
              className="object-contain"
            />
          </Link>
          <motion.div
            className="flex-1 rounded-2xl flex items-center px-4 py-3"
            style={{ backgroundColor: mainBlobColor }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="font-sans text-base sm:text-lg md:text-xl text-white leading-tight drop-shadow-sm">
              {title}
            </h1>
          </motion.div>
        </div>

        {/* Ligne 2 : Contenu (accroche, sousTitre, CTA) pleine largeur */}
        {(accroche || sousTitre || ctaTexte) && (
          <div className="flex flex-col gap-3 px-1 py-4">
            {accroche && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="font-sans text-xl sm:text-2xl text-brand-green leading-tight"
              >
                {accroche}
              </motion.h2>
            )}
            {sousTitre && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="text-sm sm:text-base text-brand-gray leading-relaxed"
              >
                {sousTitre}
              </motion.p>
            )}
            {ctaTexte && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <a
                  href={ctaLien?.url || "#contact"}
                  target={ctaLien?.target || undefined}
                  className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: mainBlobColor }}
                >
                  {ctaTexte}
                </a>
              </motion.div>
            )}
          </div>
        )}

        {/* Ligne 3 : Vidéo / image pleine largeur */}
        <div
          className="relative w-full aspect-video overflow-hidden bg-black"
          style={{ borderRadius: "15px" }}
        >
          {videoOrImage}
        </div>
      </section>

      {/* ====== DESKTOP (lg+) ====== */}
      <section className="hidden lg:grid relative h-[calc(100vh-82px)] grid-cols-4 grid-rows-5">
        {/* Fond vidéo / image — 3 colonnes sur 4 */}
        <div
          className="col-start-1 col-end-4 row-start-1 row-end-6 relative overflow-hidden bg-black"
          style={{ borderRadius: "15px" }}
        >
          {videoOrImage}
        </div>

        {/* Encoche logo — haut gauche */}
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

        {/* Encoche titre — haut droite */}
        <div
          className="absolute top-0 right-0 z-10 bg-background pl-2 pb-2 rounded-bl-2xl"
          style={{ height: "40%", width: "25%" }}
        >
          <motion.div
            className="h-full w-full rounded-2xl flex items-end p-4"
            style={{ backgroundColor: mainBlobColor }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="font-sans text-2xl xl:text-4xl text-white leading-tight drop-shadow-sm">
              {title}
            </h1>
          </motion.div>
          {/* Arrondi convexe — gauche */}
          <div
            className="absolute top-0 -left-[15px]"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
          {/* Arrondi convexe — bas droite */}
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

        {/* Contenu séminaires — sous la boîte titre, même colonne */}
        {(accroche || sousTitre || ctaTexte) && (
          <div
            className="absolute right-0 z-10 flex flex-col justify-end p-6"
            style={{ top: "40%", width: "25%", bottom: 0 }}
          >
            {accroche && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="font-sans text-2xl xl:text-3xl text-brand-green leading-tight mb-3"
              >
                {accroche}
              </motion.h2>
            )}
            {sousTitre && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="text-base text-brand-gray leading-relaxed mb-4 drop-shadow-sm"
              >
                {sousTitre}
              </motion.p>
            )}
            {ctaTexte && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <a
                  href={ctaLien?.url || "#contact"}
                  target={ctaLien?.target || undefined}
                  className="inline-block px-6 py-3 rounded-full text-base font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: mainBlobColor }}
                >
                  {ctaTexte}
                </a>
              </motion.div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
