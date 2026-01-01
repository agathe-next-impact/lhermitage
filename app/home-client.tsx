"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroCard } from "@/components/hero-card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { AnimatedHeading } from "@/components/animated-heading"

function getYouTubeEmbedUrl(oembedUrl: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = oembedUrl.match(pattern)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&autohide=1`
    }
  }

  return null
}

const blobShape = {
  path: "M158.151 0C294.644 0 400 115.89 400 252.451C400 366.426 272.07 415.632 158.151 415.632C69.4297 415.632 0 341.217 0 252.451C0 136.098 41.8567 0 158.151 0Z",
  viewBox: "0 0 400 416",
}

interface HomeClientProps {
  homepage: any
  sejours: any[]
  hebergements: any[]
  evenements: any[]
}

export function HomeClient({ homepage, sejours, hebergements, evenements }: HomeClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const videoUrl = homepage?.acf?.video ? getYouTubeEmbedUrl(homepage.acf.video) : null
  const slogan = homepage?.acf?.slogan || "Bienvenue au Tiers-Lieu Rural"

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {videoUrl ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            <iframe
              src={videoUrl}
              className="absolute pointer-events-none will-change-transform"
              style={{
                width: "120vw",
                height: "120vh",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              allow="autoplay; encrypted-media"
              frameBorder="0"
              loading="lazy"
              title="Hero background video"
            />
          </div>
        ) : (
          <Image
            src="/rural-retreat-center-in-nature-with-mountains.jpg"
            alt="Tiers-Lieu Rural"
            fill
            className="object-cover z-0"
            priority
            quality={75}
            sizes="100vw"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16 z-10">
          {/* Main blob with slogan */}
          <div className="relative w-full max-w-md aspect-square">
            <motion.svg
              viewBox={blobShape.viewBox}
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
              animate={mounted ? { opacity: 1, clipPath: "circle(100% at 50% 50%)" } : {}}
              transition={{ duration: 1.15, ease: "easeOut", delay: 0.3 }}
            >
              <path d={blobShape.path} fill="white" opacity="0.9" />
            </motion.svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-6 md:p-8 lg:p-10"
              initial={{ opacity: 0, x: -30 }}
              animate={mounted ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1.15, ease: "easeOut", delay: 0.3 }}
            >
              <h1 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-center text-[#E75754] leading-tight">
                {slogan}
              </h1>
            </motion.div>

            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 md:w-32 md:h-32 opacity-80"
              initial={{ opacity: 0, scale: 0 }}
              animate={mounted ? { opacity: 0.8, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" loading="lazy" quality={65} />
            </motion.div>

            <motion.div
              className="absolute -bottom-12 -left-12 w-32 h-32 md:w-40 md:h-40 opacity-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={mounted ? { opacity: 0.5, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" loading="lazy" quality={65} />
            </motion.div>

            <motion.div
              className="absolute top-1/2 -right-6 w-20 h-20 md:w-28 md:h-28 opacity-30"
              initial={{ opacity: 0, scale: 0 }}
              animate={mounted ? { opacity: 0.3, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Image src="/logo-arcs-light.png" alt="" fill className="object-contain" loading="lazy" quality={65} />
            </motion.div>
          </div>
        </div>

        <div className="container relative mx-auto flex h-full flex-col items-center justify-end px-4 pb-16 z-20">
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/sejours-collectifs" prefetch={false}>Séjours Collectifs</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sejours-individuels" prefetch={false}>Séjours Individuels</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedHeading className="mb-8">Nos Séjours</AnimatedHeading>
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
          <AnimatedHeading className="mb-8">Nos Hébergements</AnimatedHeading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hebergements.slice(0, 3).map((hebergement) => {
              const description = hebergement.acf?.descriptif
                ? hebergement.acf.descriptif.replace(/<[^>]*>/g, "").substring(0, 150)
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
            <AnimatedHeading className="mb-8">Événements à venir</AnimatedHeading>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {evenements.slice(0, 3).map((evenement) => {
                const subtitle = evenement.acf?.date_de_debut
                  ? `${evenement.acf.date_de_debut}${evenement.acf.heure_de_debut ? ` - ${evenement.acf.heure_de_debut}` : ""}`
                  : undefined

                const description = evenement.acf?.descriptif
                  ? evenement.acf.descriptif.replace(/<[^>]*>/g, "").substring(0, 150)
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
