"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Camera } from "lucide-react"
import Image from "next/image"
import { sanitizeUrl } from "@/lib/wordpress/sanitize"

interface MapPinPointData {
  id: number
  type: string
  title: string
  slug: string
  link: string
  mapPinPoint: {
    visibilite: boolean
    nom?: string
    images?: Array<{ url: string; alt: string }>
    descriptif?: string
    lien?: string | { url: string; title: string }
    position?: {
      latitude: number
      longitude: number
      altitude: number
    }
  }
}

interface GuidedTourProps {
  mapPinPoints: MapPinPointData[]
}

const PANORAMAX_VIEWER_URL = "https://panoramax.ign.fr"

export function GuidedTour({ mapPinPoints }: GuidedTourProps) {
  const [currentStop, setCurrentStop] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)
  const initSentRef = useRef(false)

  const overviewStop = {
    name: "Vue d'ensemble",
    description:
      "Bienvenue dans la visite virtuelle de l'Hermitage Saint-Antoine. Découvrez les différents points d'intérêt en cliquant sur les vignettes.",
    longitude: 3.128,
    latitude: 49.437,
    zoom: 16,
    image: "/logo-hermitage.webp",
    link: "",
    externalLink: "",
    type: "vue-panoramique",
    slug: "overview",
    pointId: 0,
  }

  const dataStops = mapPinPoints.map((point) => ({
    name: point.mapPinPoint?.nom || point.title || "Point d'intérêt",
    description: point.mapPinPoint?.descriptif || "",
    longitude: point.mapPinPoint?.position?.longitude || 3.128,
    latitude: point.mapPinPoint?.position?.latitude || 49.437,
    zoom: 19,
    image: point.mapPinPoint?.images?.[0]?.url,
    link: `/${point.type}/${point.slug}`,
    externalLink: sanitizeUrl(typeof point.mapPinPoint?.lien === "string" ? point.mapPinPoint?.lien : point.mapPinPoint?.lien?.url || ""),
    type: point.type,
    slug: point.slug,
    pointId: point.id,
  }))

  const tourStops = [overviewStop, ...dataStops]
  // </CHANGE>

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return
      if (event.data.type === "ready") {
        setMapReady(true)
      }
      if (event.data.type === "markerClick") {
        const stopIndex = event.data.stopIndex
        handleStopClick(stopIndex)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleIframeLoad = () => {
    if (initSentRef.current) {
      return
    }

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "init",
          data: {
            latitude: tourStops[0].latitude,
            longitude: tourStops[0].longitude,
            zoom: tourStops[0].zoom,
            stops: tourStops,
          },
        },
        "*",
      )
      initSentRef.current = true
    }
  }

  useEffect(() => {
    if (mapReady && iframeRef.current?.contentWindow) {
      const stop = tourStops[currentStop]
      iframeRef.current.contentWindow.postMessage(
        {
          type: "flyTo",
          data: {
            latitude: stop.latitude,
            longitude: stop.longitude,
            zoom: stop.zoom,
            duration: 3000,
          },
        },
        "*",
      )
    }
  }, [currentStop, mapReady])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStop(0)
      setIsPlaying(false)
      setIsTransitioning(false)
    }, 300)
  }

  const handlePrevious = () => {
    if (currentStop > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStop(currentStop - 1)
        setIsPlaying(false)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentStop < tourStops.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStop(currentStop + 1)
        setIsPlaying(false)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleStopClick = (index: number) => {
    if (index !== currentStop) {
      setShowInfoPanel(false)
      setIsTransitioning(true)
      setIsPlaying(false)
      setTimeout(() => {
        setCurrentStop(index)
        setIsTransitioning(false)
        setTimeout(() => {
          setShowInfoPanel(true)
        }, 100)
        setTimeout(() => {
          if (mapContainerRef.current) {
            const headerHeight = 80
            const elementTop = mapContainerRef.current.getBoundingClientRect().top + window.pageYOffset

            window.scrollTo({
              top: elementTop - headerHeight,
              behavior: "smooth",
            })
          }
        }, 50)
      }, 300)
    }
  }

  const currentStopData = tourStops[currentStop]

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content area - 75% width on large screens */}
      <div className="flex-1 lg:w-3/4 space-y-6">
        {/* Main Panoramax viewer */}
        <div
          ref={mapContainerRef}
          className="relative overflow-hidden rounded-xl border-2 border-muted bg-black shadow-2xl"
        >
          <div className="relative h-[70vh] min-h-[600px] w-full">
            <iframe
              ref={iframeRef}
              src="/satellite-viewer.html"
              className="absolute inset-0 w-full h-full border-0"
              title="Vue Satellite IGN"
              onLoad={handleIframeLoad}
              loading="eager"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top info bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <div className="rounded-lg bg-black/70 backdrop-blur-md px-4 py-2 text-white border border-white/20">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {currentStop + 1} / {tourStops.length}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-black/70 backdrop-blur-md px-3 py-1.5 text-white border border-white/20">
                <span className="text-xs font-medium">IGN Satellite</span>
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ease-out ${
                showInfoPanel ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
            >
              <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-muted mx-4 mb-4 flex overflow-hidden">
                {currentStopData.image && (
                  <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-l-2xl bg-white p-2">
                    <div className="relative h-full w-full rounded-lg overflow-hidden">
                      <Image
                        src={currentStopData.image || "/placeholder.svg"}
                        alt={currentStopData.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="128px"
                        loading="lazy"
                      />
                    </div>

                    {/* Category badge */}
                    {currentStopData.type && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md z-10 capitalize">
                        {currentStopData.type}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex-1 p-3 space-y-1.5">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground text-balance leading-tight">
                      {currentStopData.name}
                    </h3>
                  </div>

                  {/* Description - limited to 2 lines */}
                  {currentStopData.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {currentStopData.description}
                    </p>
                  )}

                  {currentStopData.link && (
                    <div className="pt-0.5">
                      <Button variant="default" size="sm" asChild>
                        <a href={currentStopData.link} className="flex items-center gap-2">
                          Voir les détails
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-lg border border-muted bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Vue satellite haute résolution IGN</p>
              <p className="text-muted-foreground text-xs">
                Explorez chaque point d'intérêt en vue satellite grâce aux orthophotos de l'Institut National de
                l'Information Géographique et Forestière (IGN).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/4 lg:max-w-sm">
        <div className="sticky top-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Points d'intérêt ({tourStops.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 max-h-[80vh] overflow-y-scroll pr-2">
            {tourStops.map((stop, index) => (
              <button
                key={index}
                onClick={() => handleStopClick(index)}
                className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentStop
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {stop.image ? (
                  <Image
                    src={stop.image || "/placeholder.svg"}
                    alt={stop.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110 rounded-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 12.5vw"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-lg">
                    <Camera className="h-8 w-8 text-primary/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium text-white line-clamp-2 text-balance">{stop.name}</p>
                </div>
                {index === currentStop && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
                <div className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5">
                  <span className="text-xs font-medium text-white flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
