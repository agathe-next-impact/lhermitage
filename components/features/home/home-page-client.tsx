"use client"

import Image from "next/image"
import { HeroCard } from "@/components/features/home/hero-card"
import { VideoBackground } from "@/components/features/home/video-background"
import type { WPPage, WPPost, SejourACF, HebergementACF, EvenementACF } from "@/lib/wordpress/types"

interface HomePageClientProps {
  homepage: WPPage
  sejours: WPPost<SejourACF>[]
  hebergements: WPPost<HebergementACF>[]
  evenements: WPPost<EvenementACF>[]
}

export function HomePageClient({
  homepage,
  sejours,
  hebergements,
  evenements,
}: HomePageClientProps) {
  const videoUrl = homepage.acf?.video || null

  return (
    <div className="mt-[90px] flex flex-col">
      {/* Hero Section - Grid 4 colonnes × 5 lignes */}
      <section className="w-[calc(100%-1rem)] mx-auto relative h-[calc(100vh-82px)] grid grid-cols-4 grid-rows-5">
        {/* Vidéo : couvre toute la grille en fond */}
        <div
          className="col-start-1 col-end-5 row-start-1 row-end-6 relative overflow-hidden bg-black"
          style={{ borderRadius: "15px" }}
        >
          {videoUrl ? (
            <VideoBackground videoUrl={videoUrl} />
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
        {/* Masque coin supérieur droit : crée la forme en escalier (3 col haut / 4 col bas) */}
        <div className="col-start-4 col-end-5 row-start-1 row-end-3 z-10 bg-background relative flex items-end pb-2 pl-2 rounded-bl-2xl">
          <div className="h-full flex flex-col justify-between p-4 bg-brand-coral backdrop-blur-sm rounded-lg">
            <Image
              src="/logo-hermitage-new.png"
              alt="Logo du Tiers-Lieu Rural"
              width={300}
              height={150}
              className="mb-2 w-full h-full object-contain"
            />
            <h1 className="font-heading text-2xl font-bold leading-tight text-white">
              {homepage.acf?.slogan || "Bienvenue au Tiers-Lieu Rural"}
            </h1>
          </div>
          {/* Arrondi convexe - fin de la 1ère ligne */}
          <div
            className="absolute top-0 -left-[15px]"
            style={{
              width: "15px",
              height: "15px",
              background:
                "radial-gradient(circle at 0% 100%, transparent 15px, var(--background) 15px)",
            }}
          />
          {/* Arrondi convexe - début de la 3e ligne (pleine largeur) */}
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
      </section>

      {/* Featured Stays */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 font-serif text-3xl font-bold text-center md:text-4xl">
            Nos Séjours
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sejours.slice(0, 3).map((sejour) => (
              <HeroCard
                key={sejour.id}
                title={sejour.acf?.nom || sejour.title.rendered}
                image={sejour._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
                imageAlt={
                  sejour._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || sejour.title.rendered
                }
                link={`/sejour/${sejour.slug}`}
                linkText="En savoir plus"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Accommodations */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 font-serif text-3xl font-bold text-center md:text-4xl">
            Nos Hébergements
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hebergements.slice(0, 3).map((hebergement) => {
              const description = hebergement.acf?.descriptif
                ? hebergement.acf.descriptif.replace(/<[^>]*>/g, "")
                : undefined

              return (
                <HeroCard
                  key={hebergement.id}
                  title={hebergement.acf?.nom || hebergement.title.rendered}
                  description={description}
                  image={hebergement._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
                  imageAlt={
                    hebergement._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
                    hebergement.title.rendered
                  }
                  link={`/hebergement/${hebergement.slug}`}
                  linkText="Découvrir"
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {evenements.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 font-serif text-3xl font-bold text-center md:text-4xl">
              Événements à venir
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {evenements.slice(0, 3).map((evenement) => {
                const subtitle = evenement.acf?.date_de_debut
                  ? `${evenement.acf.date_de_debut}${evenement.acf.heure_de_debut ? ` - ${evenement.acf.heure_de_debut}` : ""}`
                  : undefined

                const description = evenement.acf?.descriptif
                  ? evenement.acf.descriptif.replace(/<[^>]*>/g, "")
                  : undefined

                return (
                  <HeroCard
                    key={evenement.id}
                    title={evenement.acf?.nom || evenement.title.rendered}
                    subtitle={subtitle}
                    description={description}
                    image={evenement._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
                    imageAlt={
                      evenement._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
                      evenement.title.rendered
                    }
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
