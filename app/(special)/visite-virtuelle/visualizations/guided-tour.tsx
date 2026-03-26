"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Camera } from "lucide-react"
import Image from "next/image"
import { sanitizeUrl } from "@/lib/wordpress/sanitize"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { IGN_SATELLITE_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/map/ign-style"
import type { MapPinPointData, TourStop } from "@/lib/map/types"

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  hebergement: { label: "Hébergement", color: "#56939F" },
  structure: { label: "Structure", color: "#78AD7D" },
  "espace-de-travail": { label: "Espace de travail", color: "#DC6F45" },
  "vue-panoramique": { label: "Vue panoramique", color: "#C14C66" },
}

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? { label: type, color: "#535353" }
}

interface GuidedTourProps {
  mapPinPoints: MapPinPointData[]
}

function buildTourStops(mapPinPoints: MapPinPointData[]): TourStop[] {
  const overviewStop: TourStop = {
    name: "SURVOLEZ L'HERMITAGE",
    description:
      "",
    longitude: DEFAULT_CENTER.lng,
    latitude: DEFAULT_CENTER.lat,
    zoom: DEFAULT_ZOOM,
    image: "/logo-arcs-coral.png",
    link: "",
    externalLink: "",
    type: "",
    slug: "overview",
    pointId: 0,
  }

  const dataStops: TourStop[] = mapPinPoints
    .filter(
      (point) => point.mapPinPoint?.position?.latitude && point.mapPinPoint?.position?.longitude
    )
    .map((point) => ({
      name: point.mapPinPoint?.nom || point.title || "Point d'intérêt",
      description: point.mapPinPoint?.descriptif || "",
      longitude: point.mapPinPoint!.position!.longitude,
      latitude: point.mapPinPoint!.position!.latitude,
      zoom: 19,
      image: point.mapPinPoint?.images?.[0]?.url,
      link: `/${point.type}/${point.slug}`,
      externalLink: sanitizeUrl(
        typeof point.mapPinPoint?.lien === "string"
          ? point.mapPinPoint?.lien
          : point.mapPinPoint?.lien?.url || ""
      ),
      type: point.type,
      slug: point.slug,
      pointId: point.id,
    }))

  return [overviewStop, ...dataStops]
}

function createMarkerElement(isActive: boolean): HTMLDivElement {
  const el = document.createElement("div")
  el.style.width = isActive ? "20px" : "14px"
  el.style.height = isActive ? "20px" : "14px"
  el.style.borderRadius = "50%"
  el.style.border = "2px solid white"
  el.style.backgroundColor = isActive ? "#e75754" : "rgba(231, 87, 84, 0.8)"
  el.style.boxShadow = isActive
    ? "0 0 0 3px rgba(231, 87, 84, 0.4), 0 2px 8px rgba(0,0,0,0.3)"
    : "0 2px 6px rgba(0,0,0,0.3)"
  el.style.cursor = "pointer"
  el.style.transition = "all 0.2s ease"
  return el
}

function updateMarkerStyle(el: HTMLElement, isActive: boolean) {
  el.style.width = isActive ? "20px" : "14px"
  el.style.height = isActive ? "20px" : "14px"
  el.style.backgroundColor = isActive ? "#e75754" : "rgba(231, 87, 84, 0.8)"
  el.style.boxShadow = isActive
    ? "0 0 0 3px rgba(231, 87, 84, 0.4), 0 2px 8px rgba(0,0,0,0.3)"
    : "0 2px 6px rgba(0,0,0,0.3)"
}

export function GuidedTour({ mapPinPoints }: GuidedTourProps) {
  const [currentStop, setCurrentStop] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const tourStopsRef = useRef<TourStop[]>([])
  const currentStopRef = useRef(0)
  const isTransitioningRef = useRef(false)
  const prefersReducedMotionRef = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  )

  const tourStops = useMemo(() => buildTourStops(mapPinPoints), [mapPinPoints])

  useEffect(() => {
    tourStopsRef.current = tourStops
  }, [tourStops])

  const navigateToStop = useCallback((index: number) => {
    if (index === currentStopRef.current || isTransitioningRef.current) return

    setShowInfoPanel(false)
    setIsTransitioning(true)
    isTransitioningRef.current = true
    currentStopRef.current = index
    setCurrentStop(index)
  }, [])

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const abortController = new AbortController()
    const { signal } = abortController

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: IGN_SATELLITE_STYLE,
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    })

    mapRef.current = map

    map.on("load", () => {
      setMapLoaded(true)

      // Add markers for data stops (skip overview at index 0)
      tourStopsRef.current.forEach((stop, index) => {
        if (index === 0) return

        const el = createMarkerElement(index === currentStopRef.current)
        el.setAttribute("role", "button")
        el.setAttribute("aria-label", `Point d'intérêt : ${stop.name}`)
        el.setAttribute("tabindex", "0")

        el.addEventListener("click", () => navigateToStop(index), { signal })
        el.addEventListener(
          "keydown",
          (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              navigateToStop(index)
            }
          },
          { signal }
        )
        el.addEventListener(
          "mouseenter",
          () => {
            el.style.width = "20px"
            el.style.height = "20px"
            el.style.boxShadow = "0 0 0 4px rgba(231, 87, 84, 0.4), 0 2px 8px rgba(0,0,0,0.3)"
          },
          { signal }
        )
        el.addEventListener(
          "mouseleave",
          () => {
            const isActive = currentStopRef.current === index
            updateMarkerStyle(el, isActive)
          },
          { signal }
        )

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(map)

        markersRef.current.push(marker)
      })
    })

    return () => {
      abortController.abort()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [navigateToStop])

  // Fly to current stop when it changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const stop = tourStops[currentStop]

    const duration = prefersReducedMotionRef.current ? 0 : 3000

    // Show info panel early (after 40% of flight) instead of waiting for moveend
    const panelTimer = setTimeout(() => {
      setShowInfoPanel(true)
    }, duration * 0.4)

    const onMoveEnd = () => {
      setIsTransitioning(false)
      isTransitioningRef.current = false
    }

    map.flyTo({
      center: [stop.longitude, stop.latitude],
      zoom: stop.zoom,
      duration,
      essential: true,
    })

    // Update marker styles
    markersRef.current.forEach((marker, i) => {
      const markerStopIndex = i + 1 // offset: overview has no marker
      updateMarkerStyle(marker.getElement(), markerStopIndex === currentStop)
    })

    map.once("moveend", onMoveEnd)

    // Scroll map into view
    if (mapContainerRef.current && currentStop > 0) {
      const headerHeight = 80
      const elementTop = mapContainerRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementTop - headerHeight,
        behavior: "smooth",
      })
    }

    return () => {
      clearTimeout(panelTimer)
      map.off("moveend", onMoveEnd)
    }
  }, [currentStop, mapLoaded, tourStops])

  const currentStopData = tourStops[currentStop]

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Zone carte principale — 75% sur grand écran */}
      <div className="flex-1 lg:w-3/4 space-y-6">
        <div className="relative overflow-hidden rounded-xl border-2 border-muted bg-black shadow-2xl">
          <div className="relative h-[70vh] min-h-[600px] w-full">
            <div
              ref={mapContainerRef}
              className="absolute inset-0 w-full h-full"
              role="application"
              aria-label="Carte satellite interactive - Visite virtuelle de l'Hermitage"
            />

            {/* Loading overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-muted to-background">
                <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg border border-muted max-w-xs">
                  <div className="mx-auto h-12 w-12 rounded-full border-[3px] border-muted border-t-primary animate-spin" />
                  <div>
                    <p className="font-semibold text-foreground">Chargement de la carte</p>
                    <p className="text-xs text-muted-foreground">Images satellite IGN</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-[1]" />

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

            {/* Info panel */}
            <div
              role="region"
              aria-live="polite"
              aria-label="Informations sur le point d'intérêt"
              className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ease-out ${
                showInfoPanel ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
            >
              <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-muted mx-4 mb-4 flex overflow-hidden">
                {currentStopData.image && (
                  <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-l-2xl bg-white p-2">
                    <div className="relative h-full w-full rounded-lg overflow-hidden">
                      <Image
                        src={currentStopData.image}
                        alt={currentStopData.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="128px"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 p-3 space-y-1.5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground text-balance leading-tight">
                      {currentStopData.name}
                    </h3>
                  </div>

                  {currentStopData.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {currentStopData.description}
                    </p>
                  )}

                  {currentStopData.type && (
                    <div className="pt-0.5">
                      <span
                        className="inline-block text-white text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: getTypeConfig(currentStopData.type).color }}
                      >
                        {getTypeConfig(currentStopData.type).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar — vignettes des points d'intérêt */}
      <div className="lg:w-1/4 lg:max-w-sm">
        <div className="sticky top-24 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Points d&apos;intérêt ({tourStops.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 max-h-[80vh] overflow-y-auto pr-2">
            {tourStops.map((stop, index) => (
              <button
                key={stop.pointId}
                onClick={() => navigateToStop(index)}
                aria-label={`Voir ${stop.name}`}
                aria-current={index === currentStop ? "true" : undefined}
                className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentStop
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {stop.image ? (
                  <Image
                    src={stop.image}
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
                  <p className="text-xs font-medium text-white line-clamp-2 text-balance">
                    {stop.name}
                  </p>
                </div>
                {index === currentStop && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
                <div
                  className="absolute top-2 left-2 h-3 w-3 rounded-full border border-white/50 shadow-sm"
                  style={{ backgroundColor: getTypeConfig(stop.type).color }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
