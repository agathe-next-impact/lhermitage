"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroCard } from "@/components/features/home/hero-card"
import { motion } from "framer-motion"
import { useState } from "react"
import { VideoBackground } from "@/components/features/home/video-background"
import { useIsMounted } from "@/hooks/use-is-mounted"

interface HomePageClientProps {
  homepage: any
  sejours: any[]
  hebergements: any[]
  evenements: any[]
}

export function HomePageClient({ homepage, sejours, hebergements, evenements }: HomePageClientProps) {
  const mounted = useIsMounted()
  const [showContent, setShowContent] = useState(false)

  const handleVideoPlay = () => {
    // Start delay timer when video starts playing
    setTimeout(() => {
      setShowContent(true)
    }, 3500) // 3.5 seconds delay
  }

  const videoUrl = homepage.acf?.video || null // Use raw video URL for VideoBackground
  const slogan = homepage.acf?.slogan || "Bienvenue au Tiers-Lieu Rural"

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {videoUrl ? (
          <VideoBackground videoUrl={videoUrl} onPlay={handleVideoPlay} />
        ) : (
          <Image
            src="/rural-retreat-center-in-nature-with-mountains.jpg"
            alt="Tiers-Lieu Rural"
            fill
            className="object-cover z-0"
            priority
            onLoad={() => setShowContent(true)} // Show content immediately if image fallback
          />
        )}

        <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16 z-10">
          {/* Main blob with slogan */}
          <div className="relative w-full max-w-md aspect-square">
            {/* Added animation to main blob */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
              animate={
                showContent
                  ? { opacity: 1, clipPath: "circle(100% at 50% 50%)" }
                  : { opacity: 0, clipPath: "circle(0% at 50% 50%)" }
              }
              transition={{ duration: 1.15, ease: "easeOut" }}
            >
              <svg
                viewBox="0 0 400 416"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M158.151 0C294.644 0 400 115.89 400 252.451C400 366.426 272.07 415.632 158.151 415.632C69.4297 415.632 0 341.217 0 252.451C0 136.098 41.8567 0 158.151 0Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-6 md:p-8 lg:p-10"
              initial={{ opacity: 0, x: -30 }}
              animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 1.15, ease: "easeOut" }}
            >
              <h1 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-center text-[#E75754] leading-tight">
                {slogan}
              </h1>
            </motion.div>

            {/* Added animations to logo icons with staggered delays */}
            {/* Logo 1 - top right with highest opacity */}
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 md:w-32 md:h-32 opacity-80"
              initial={{ opacity: 0, scale: 0 }}
              animate={showContent ? { opacity: 0.8, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" />
            </motion.div>

            {/* Logo 2 - bottom left with medium opacity */}
            <motion.div
              className="absolute -bottom-12 -left-12 w-32 h-32 md:w-40 md:h-40 opacity-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={showContent ? { opacity: 0.5, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" />
            </motion.div>

            {/* Logo 3 - right side with lowest opacity */}
            <motion.div
              className="absolute top-1/2 -right-6 w-20 h-20 md:w-28 md:h-28 opacity-30"
              initial={{ opacity: 0, scale: 0 }}
              animate={showContent ? { opacity: 0.3, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" />
            </motion.div>
          </div>
        </div>

        <div className="container relative mx-auto flex h-full flex-col items-center justify-end px-4 pb-16 z-20">
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button asChild size="lg">
              <Link href="/sejours-collectifs">Séjours Collectifs</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sejours-individuels">Séjours Individuels</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 font-serif text-3xl font-bold text-center md:text-4xl">Nos Séjours</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sejours.slice(0, 3).map((sejour) => (
              <HeroCard
                key={sejour.id}
                title={sejour.acf?.nom || sejour.title.rendered}
                image={sejour._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
                imageAlt={sejour._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || sejour.title.rendered}
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
          <h2 className="mb-8 font-serif text-3xl font-bold text-center md:text-4xl">Nos Hébergements</h2>
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
                  imageAlt={hebergement._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || hebergement.title.rendered}
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
            <h2 className="mb-8 font-serif text-3xl font-bold text-center md:text-4xl">Événements à venir</h2>
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
                    imageAlt={evenement._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || evenement.title.rendered}
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
