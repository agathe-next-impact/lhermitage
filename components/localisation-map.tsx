"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { IGN_PLAN_STYLE } from "@/lib/map/ign-style"
import { BRAND_COLORS } from "@/lib/theme/colors"
import { Navigation } from "lucide-react"

const HERMITAGE_COORDS = { lng: 3.128, lat: 49.437 } as const
const DIRECTIONS_URL = `https://www.openstreetmap.org/directions?engine=osrm_car&route=;${HERMITAGE_COORDS.lat},${HERMITAGE_COORDS.lng}#map=15/${HERMITAGE_COORDS.lat}/${HERMITAGE_COORDS.lng}`

export function LocalisationMap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: IGN_PLAN_STYLE,
      center: [HERMITAGE_COORDS.lng, HERMITAGE_COORDS.lat],
      zoom: 15,
      attributionControl: {},
    })

    map.addControl(new maplibregl.NavigationControl(), "top-right")

    new maplibregl.Marker({ color: BRAND_COLORS.coral })
      .setLngLat([HERMITAGE_COORDS.lng, HERMITAGE_COORDS.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<strong>L'Hermitage</strong><br/>17 rue de l'Hermitage<br/>60350 Autrêches`
        )
      )
      .addTo(map)

    return () => map.remove()
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90"
        style={{ backgroundColor: BRAND_COLORS.coral }}
      >
        <Navigation className="h-4 w-4" />
        Itinéraire
      </a>
    </div>
  )
}
