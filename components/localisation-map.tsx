"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { IGN_PLAN_STYLE } from "@/lib/map/ign-style"
import { BRAND_COLORS } from "@/lib/theme/colors"

const HERMITAGE_COORDS = { lng: 3.128, lat: 49.437 } as const

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

  return <div ref={containerRef} className="h-full w-full" />
}
