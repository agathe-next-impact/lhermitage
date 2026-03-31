"use client"

import Image from "next/image"
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack"
import type { WPImage, WPPost, EvenementACF } from "@/lib/wordpress/types"
import Link from "next/link"
import { ArrowRight, House, HousePlug, PersonStanding, Plane } from "lucide-react"
import {
  MinimalCard,
  MinimalCardImage,
  MinimalCardTitle,
  MinimalCardDescription,
  MinimalCardContent,
} from "@/components/ui/minimal-card"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { stripHtml } from "@/lib/utils"
import { useState, useEffect } from "react"

interface HomePageScrollStackProps {
  hebergementsEtSejours?: {
    titre?: string
    descriptif?: string
    images_du_bento?: WPImage[]
  }
  evenementsSection?: {
    titre?: string
    description?: string
    voir_agenda?: { url: string; title?: string; target?: string }
    image?: WPImage
  }
  recrutementSection?: {
    titre?: string
    offre?: Array<{
      titre?: string
      type_de_poste?: string
      mission_principale?: string
    }>
    voir_toutes_les_offres?: { url: string; title?: string; target?: string }
    images?: WPImage[]
  }
  evenements?: WPPost<EvenementACF>[]
}

function getUpcomingEvenements(evenements: WPPost<EvenementACF>[], count: number) {
  const now = new Date()
  return evenements
    .filter((e) => {
      const startDate = e.acf?.eventDateStart
      if (!startDate) return false
      return new Date(startDate) >= now
    })
    .sort((a, b) => {
      const dateA = new Date(a.acf?.eventDateStart || "")
      const dateB = new Date(b.acf?.eventDateStart || "")
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, count)
}

function formatEventDate(dateStr?: string) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  return isDesktop
}

function HebergementsCard({ hebergementsEtSejours }: { hebergementsEtSejours?: HomePageScrollStackProps["hebergementsEtSejours"] }) {
  const images = hebergementsEtSejours?.images_du_bento || []
  const firstImage = images[0]
  const restImages = images.slice(1)

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {hebergementsEtSejours?.titre || "Hébergements et Séjours"}
          </h2>
          {hebergementsEtSejours?.descriptif && (
            <div
              className="prose prose-invert text-white/90"
              dangerouslySetInnerHTML={{ __html: hebergementsEtSejours.descriptif }}
            />
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="group w-max bg-white bg-opacity-20 backdrop-blur-sm pl-3 pr-4 pt-2 pb-1 rounded-full transition-all duration-300 ease-in-out hover:pr-5">
              <Link className="inline-flex items-center gap-1 text-white font-semibold" href="/hebergements">
                <House size={20} className="text-white" />
                &nbsp;Hébergements
                <ArrowRight size={16} className="transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="group w-max bg-white bg-opacity-20 backdrop-blur-sm pl-3 pr-4 pt-2 pb-1 rounded-full transition-all duration-300 ease-in-out hover:pr-5">
              <Link className="inline-flex items-center gap-1 text-white font-semibold" href="/sejours">
                <Plane size={20} className="text-white" />
                &nbsp;Séjours
                <ArrowRight size={16} className="opacity-0 -translate-x-2 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="group w-max bg-white bg-opacity-20 backdrop-blur-sm pl-3 pr-4 pt-2 pb-1 rounded-full transition-all duration-300 ease-in-out hover:pr-5">
              <Link className="inline-flex items-center gap-1 text-white font-semibold" href="/hebergements">
                <PersonStanding size={20} className="text-white" />
                &nbsp;
                Activités
                <ArrowRight size={16} className="opacity-0 -translate-x-2 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="group w-max bg-white bg-opacity-20 backdrop-blur-sm pl-3 pr-4 pt-2 pb-1 rounded-full transition-all duration-300 ease-in-out hover:pr-5">
              <Link className="inline-flex items-center gap-1 text-white font-semibold" href="/sejours">
                <HousePlug size={20} className="text-white" />
                &nbsp;Espaces de travail
                <ArrowRight size={16} className="opacity-0 -translate-x-2 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
        {firstImage && (
          <div>
            <Image
              src={firstImage.url}
              alt={firstImage.alt || "Hébergements et Séjours"}
              width={300}
              height={200}
              className="object-cover rounded-lg w-full h-[30vh]"
            />
          </div>
        )}
      </div>
      {restImages.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {restImages.map((img, index) => (
            <div key={img.id || index} className="col-span-1">
              <Image
                src={img.url}
                alt={img.alt || `Image ${index + 2}`}
                width={400}
                height={300}
                className="object-cover rounded-lg w-full h-[20vh] lg:h-[30vh]"
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function EvenementsCard({ evenementsSection, upcomingEvents }: { evenementsSection?: HomePageScrollStackProps["evenementsSection"]; upcomingEvents: WPPost<EvenementACF>[] }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {evenementsSection?.titre || "Événements à venir"}
          </h2>
          {evenementsSection?.description && (
            <div
              className="prose prose-invert text-white mb-4"
              dangerouslySetInnerHTML={{ __html: evenementsSection.description }}
            />
          )}
          {evenementsSection?.voir_agenda && (
            <div className="mt-4">
              <Link
                href={evenementsSection.voir_agenda.url}
                target={evenementsSection.voir_agenda.target}
                className="group inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm pl-3 pr-4 pt-2 pb-1 rounded-full font-semibold transition-all duration-300 ease-in-out hover:pr-5"
              >
                {evenementsSection.voir_agenda.title || "Voir l'agenda"}
                <ArrowRight size={16} className="transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
        {evenementsSection?.image && (
          <div className="relative w-full h-48 lg:h-80 mt-4 lg:mt-0">
            <Image
              src={evenementsSection.image.url}
              alt={evenementsSection.image.alt || "Événements au Tiers-Lieu Rural"}
              fill
              className="object-cover rounded-lg opacity-80"
            />
          </div>
        )}
      </div>
      {upcomingEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 lg:mt-0">
          {upcomingEvents.map((event) => {
            const featuredImage =
              event._embedded?.["wp:featuredmedia"]?.[0]?.source_url
            const dateDisplay =
              event.acf?.eventDateLabel || formatEventDate(event.acf?.eventDateStart)
            const pitch = event.acf?.eventPitch
              ? stripHtml(event.acf.eventPitch)
              : undefined
            return (
              <Link key={event.id} href={`/evenements/${event.slug}`}>
                <MinimalCard className="h-80">
                  {featuredImage && (
                    <MinimalCardImage
                      src={featuredImage}
                      alt={event.title.rendered}
                    />
                  )}
                  <MinimalCardContent className="relative z-10 flex flex-col justify-end h-full">
                    <div className="mt-auto bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <MinimalCardTitle className="text-gray-900 text-base">
                        {event.title.rendered}
                      </MinimalCardTitle>
                      {dateDisplay && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                          <Calendar size={14} className="shrink-0" />
                          <span>{dateDisplay}</span>
                        </div>
                      )}
                      {event.acf?.eventVenueLabel && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                          <MapPin size={14} className="shrink-0" />
                          <span>{event.acf.eventVenueLabel}</span>
                        </div>
                      )}
                      {event.acf?.eventAccessType && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                          <Ticket size={14} className="shrink-0" />
                          <span>{event.acf.eventAccessType}</span>
                        </div>
                      )}
                      {pitch && (
                        <MinimalCardDescription className="text-gray-500 mt-1 line-clamp-3">
                          {pitch}
                        </MinimalCardDescription>
                      )}
                    </div>
                  </MinimalCardContent>
                </MinimalCard>
              </Link>
            )
          })}
        </div>
      ) : (
        <p>Aucun événement à venir pour le moment.</p>
      )}
    </>
  )
}

function RecrutementCard({ recrutementSection }: { recrutementSection?: HomePageScrollStackProps["recrutementSection"] }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {recrutementSection?.titre || "Recrutement"}
          </h2>
          {recrutementSection?.voir_toutes_les_offres && (
            <div className="mt-4">
              <Link
                href={recrutementSection.voir_toutes_les_offres.url}
                target={recrutementSection.voir_toutes_les_offres.target}
                className="group inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm pl-3 pr-4 pt-2 pb-1 rounded-full font-semibold transition-all duration-300 ease-in-out hover:pr-5"
              >
                {recrutementSection.voir_toutes_les_offres.title || "Voir toutes les offres"}
                <ArrowRight size={16} className="transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
        {recrutementSection?.images?.[0] && (
          <div>
            <Image
              src={recrutementSection.images[0].url}
              alt={recrutementSection.images[0].alt || "Recrutement"}
              width={300}
              height={200}
              className="object-cover rounded-lg w-full h-[30vh]"
            />
          </div>
        )}
      </div>
      {(recrutementSection?.offre || recrutementSection?.images?.[1]) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recrutementSection?.offre?.slice(0, 6).map((o, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold text-lg">{o.titre}</h3>
                {o.type_de_poste && (
                  <p className="text-sm text-white/70 mt-1">{o.type_de_poste}</p>
                )}
                {o.mission_principale && (
                  <p className="text-sm mt-2">{o.mission_principale}</p>
                )}
              </div>
            ))}
          </div>
          {recrutementSection?.images?.[1] && (
            <div className="col-span-1">
              <Image
                src={recrutementSection.images[1].url}
                alt={recrutementSection.images[1].alt || "Recrutement"}
                width={400}
                height={300}
                className="object-cover rounded-lg w-full h-full"
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function HomePageScrollStack({ hebergementsEtSejours, evenementsSection, recrutementSection, evenements = [] }: HomePageScrollStackProps) {
  const isDesktop = useIsDesktop()
  const upcomingEvents = getUpcomingEvenements(evenements, 3)

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-4 px-2 mt-2">
        <div className="bg-brand-coral text-white rounded-2xl p-6 sm:p-8">
          <HebergementsCard hebergementsEtSejours={hebergementsEtSejours} />
        </div>
        <div className="bg-brand-teal text-white rounded-2xl p-6 sm:p-8">
          <EvenementsCard evenementsSection={evenementsSection} upcomingEvents={upcomingEvents} />
        </div>
        <div className="bg-brand-pink text-white rounded-2xl p-6 sm:p-8">
          <RecrutementCard recrutementSection={recrutementSection} />
        </div>
      </div>
    )
  }

  return (
    <ScrollStack useWindowScroll blurAmount={6}>
      <ScrollStackItem className="bg-brand-coral text-white">
        <HebergementsCard hebergementsEtSejours={hebergementsEtSejours} />
      </ScrollStackItem>
      <ScrollStackItem className="bg-brand-teal text-white">
        <EvenementsCard evenementsSection={evenementsSection} upcomingEvents={upcomingEvents} />
      </ScrollStackItem>
      <ScrollStackItem className="bg-brand-pink text-white">
        <RecrutementCard recrutementSection={recrutementSection} />
      </ScrollStackItem>
    </ScrollStack>
  )
}
