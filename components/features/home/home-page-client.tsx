"use client"

import Image from "next/image"
import { VideoBackground } from "@/components/features/home/video-background"
import HomePageScrollStack from "@/components/features/home/home-page-scroll-stack"
import type { WPPage, WPPost, SejourACF, HebergementACF, EvenementACF } from "@/lib/wordpress/types"

interface HomePageClientProps {
  homepage: WPPage
  evenements?: WPPost<EvenementACF>[]
}

export function HomePageClient({
  homepage,
  evenements,
}: HomePageClientProps) {
  const videoUrl = homepage.acf?.video || null
  const selfHostedVideo = homepage.acf?.video_auto_hebergee || null

  return (
    <div className="mt-[60px] flex flex-col">
      {/* Hero Section */}
      <section className="w-[calc(100%-1rem)] mx-auto relative flex flex-col md:h-[calc(100vh-82px)] md:grid md:grid-cols-4 md:grid-rows-5">
        {/* Vidéo : pleine largeur mobile, couvre toute la grille en desktop */}
        <div
          className="relative overflow-hidden bg-black aspect-video md:aspect-auto md:col-start-1 md:col-end-5 md:row-start-1 md:row-end-6"
          style={{ borderRadius: "15px" }}
        >
          {videoUrl ? (
            <VideoBackground videoUrl={videoUrl} />
          ) : selfHostedVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src={selfHostedVideo.url} type={selfHostedVideo.mime_type} />
            </video>
          ) : (
            <Image
              src="/rural-retreat-center-in-nature-with-mountains.jpg"
              alt="Tiers-Lieu Rural"
              fill
              className="object-cover z-0"
              priority
            />
          )}
        </div>
        {/* Logo + titre : en dessous sur mobile, superposé en haut à droite sur desktop */}
        <div className="p-0 pt-2 md:p-0 md:col-start-4 md:col-end-5 md:row-start-1 md:row-end-3 md:z-10 md:bg-background md:relative md:flex md:items-end md:pb-2 md:pl-2 md:rounded-bl-2xl">
          <div className="flex flex-col justify-between p-4 bg-brand-coral backdrop-blur-sm rounded-lg md:h-full">
            <Image
              src="/logo-hermitage-new.png"
              alt="Logo du Tiers-Lieu Rural"
              width={300}
              height={150}
              className="mb-6 md:mb-2 w-1/3 md:w-full h-auto md:h-full object-contain"
            />
            <h1 className="font-heading text-xl md:text-2xl font-bold leading-tight text-white">
              {homepage.acf?.slogan || "Bienvenue au Tiers-Lieu Rural"}
            </h1>
          </div>
          {/* Arrondi convexe - fin de la 1ère ligne (desktop only) */}
          <div
            className="hidden md:block absolute top-0 -left-[15px]"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
          {/* Arrondi convexe - début de la 3e ligne (desktop only) */}
          <div
            className="hidden md:block absolute bottom-0 right-0 translate-y-full"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
        </div>
      </section>

      {/* Scroll stack */}
      <HomePageScrollStack
        hebergementsEtSejours={homepage.acf?.hebergements_et_sejours}
        evenementsSection={homepage.acf?.evenements_section}
        recrutementSection={homepage.acf?.recrutement_section}
        evenements={evenements}
      />

    </div>
  )
}
