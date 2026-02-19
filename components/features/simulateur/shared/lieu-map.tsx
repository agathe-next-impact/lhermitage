"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { cn } from "@/lib/utils"

interface MapMarker {
  kind: "activite" | "espace" | "hebergement"
  slug: string
  label: string
  x: number
  y: number
}

interface ActiveZone {
  zoneId: string
  kind: "espace" | "hebergement"
  label: string
}

const KIND_STYLE: Record<MapMarker["kind"], { fill: string; stroke: string; label: string }> = {
  activite: { fill: "#E75754", stroke: "#c9403d", label: "Activités" },
  espace: { fill: "#56939F", stroke: "#3e7a85", label: "Espaces" },
  hebergement: { fill: "#2A4A51", stroke: "#1a3238", label: "Hébergements" },
}

/**
 * Zone shapes mapped by zone_plan_svg_id.
 * Each zone defines either a rect or an SVG path outline
 * matching a physical area on the domain map.
 */
const ZONE_SHAPES: Record<
  string,
  | { type: "rect"; x: number; y: number; width: number; height: number; rx?: number }
  | { type: "path"; d: string }
> = {
  // Main building complex
  "batiment-principal": { type: "rect", x: 75, y: 55, width: 50, height: 45, rx: 3 },
  "corps-central": { type: "rect", x: 80, y: 65, width: 40, height: 30, rx: 2 },
  "aile-nord": { type: "rect", x: 85, y: 55, width: 30, height: 12, rx: 2 },
  // West wing
  "aile-ouest": { type: "rect", x: 45, y: 95, width: 25, height: 18, rx: 2 },
  "pavillon-ouest": { type: "rect", x: 42, y: 92, width: 31, height: 24, rx: 3 },
  // East wing
  "aile-est": { type: "rect", x: 130, y: 90, width: 25, height: 18, rx: 2 },
  "pavillon-est": { type: "rect", x: 127, y: 87, width: 31, height: 24, rx: 3 },
  // Outdoor areas
  "terrasse-sud": { type: "rect", x: 78, y: 100, width: 44, height: 15, rx: 2 },
  "jardin-principal": {
    type: "path",
    d: "M65 120 Q65 115 80 115 L120 115 Q135 115 135 120 L135 150 Q135 155 120 155 L80 155 Q65 155 65 150 Z",
  },
  "parc-nord": {
    type: "path",
    d: "M60 35 Q80 25 120 28 Q150 30 160 50 L145 55 Q130 40 100 38 Q70 37 60 50 Z",
  },
  // Specific facilities
  piscine: { type: "rect", x: 90, y: 122, width: 20, height: 12, rx: 6 },
  "salle-reunion": { type: "rect", x: 82, y: 68, width: 16, height: 12, rx: 1 },
  restaurant: { type: "rect", x: 102, y: 68, width: 18, height: 12, rx: 1 },
  spa: { type: "rect", x: 48, y: 98, width: 18, height: 12, rx: 4 },
}

export function LieuMap() {
  const days = useSimulateurStore((s) => s.days)
  const accommodations = useSimulateurStore((s) => s.accommodations)
  const data = useSimulateurData()

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  // Collect all selected slugs and resolve to markers with coordinates
  const markers = useMemo(() => {
    const result: MapMarker[] = []
    const seen = new Set<string>()

    for (const day of days) {
      for (const slot of day.slots) {
        for (const slug of slot.activite_slugs ?? []) {
          if (seen.has(`a-${slug}`)) continue
          seen.add(`a-${slug}`)
          const act = data.activites.find((a) => a.slug === slug)
          if (act?.acf?.coordonnees_plan) {
            result.push({
              kind: "activite",
              slug,
              label: act.acf.nom,
              x: act.acf.coordonnees_plan.x,
              y: act.acf.coordonnees_plan.y,
            })
          }
        }
        for (const slug of slot.espace_slugs ?? []) {
          if (seen.has(`e-${slug}`)) continue
          seen.add(`e-${slug}`)
          const esp = data.espaces.find((e) => e.slug === slug)
          if (esp?.acf?.coordonnees_plan) {
            result.push({
              kind: "espace",
              slug,
              label: esp.acf.nom,
              x: esp.acf.coordonnees_plan.x,
              y: esp.acf.coordonnees_plan.y,
            })
          }
        }
      }
    }

    for (const acc of accommodations) {
      if (seen.has(`h-${acc.hebergement_slug}`)) continue
      seen.add(`h-${acc.hebergement_slug}`)
      const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
      if (heb?.acf?.coordonnees_plan) {
        result.push({
          kind: "hebergement",
          slug: acc.hebergement_slug,
          label: heb.acf.nom,
          x: heb.acf.coordonnees_plan.x,
          y: heb.acf.coordonnees_plan.y,
        })
      }
    }

    return result
  }, [days, accommodations, data.activites, data.espaces, data.hebergements])

  // Collect active SVG zone IDs from selected espaces & hébergements
  const activeZones = useMemo(() => {
    const zones: ActiveZone[] = []
    const seenZones = new Set<string>()

    for (const day of days) {
      for (const slot of day.slots) {
        for (const slug of slot.espace_slugs ?? []) {
          const esp = data.espaces.find((e) => e.slug === slug)
          if (esp?.acf?.zone_plan_svg_id && !seenZones.has(esp.acf.zone_plan_svg_id)) {
            seenZones.add(esp.acf.zone_plan_svg_id)
            zones.push({
              zoneId: esp.acf.zone_plan_svg_id,
              kind: "espace",
              label: esp.acf.nom,
            })
          }
        }
      }
    }

    for (const acc of accommodations) {
      const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
      if (heb?.acf?.zone_plan_svg_id && !seenZones.has(heb.acf.zone_plan_svg_id)) {
        seenZones.add(heb.acf.zone_plan_svg_id)
        zones.push({
          zoneId: heb.acf.zone_plan_svg_id,
          kind: "hebergement",
          label: heb.acf.nom,
        })
      }
    }

    return zones
  }, [days, accommodations, data.espaces, data.hebergements])

  const hasMarkers = markers.length > 0
  const hasZones = activeZones.length > 0
  const hasContent = hasMarkers || hasZones

  const activeKinds = useMemo(() => {
    const kinds = new Set<MapMarker["kind"]>()
    for (const m of markers) kinds.add(m.kind)
    return kinds
  }, [markers])

  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden p-4 md:p-6">
      <p className="font-heading uppercase text-xs font-bold tracking-wider text-muted-foreground mb-3">
        Plan du domaine
      </p>

      <div className="aspect-square rounded-lg bg-[#2A4A51]/5 relative overflow-hidden">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ─── Base map ─── */}
          <g className="text-muted-foreground/20">
            {/* Terrain outline */}
            <path
              d="M30 160 C30 160 25 100 40 70 C55 40 80 30 110 28 C140 26 165 45 175 70 C185 95 180 140 170 160 Z"
              fill="currentColor"
              opacity="0.3"
            />
            {/* Main building */}
            <rect x="75" y="65" width="50" height="35" rx="3" fill="currentColor" opacity="0.6" />
            <rect x="85" y="55" width="30" height="10" rx="2" fill="currentColor" opacity="0.5" />
            {/* Secondary buildings */}
            <rect x="45" y="95" width="25" height="18" rx="2" fill="currentColor" opacity="0.4" />
            <rect x="130" y="90" width="25" height="18" rx="2" fill="currentColor" opacity="0.4" />
            {/* Paths */}
            <path
              d="M100 100 L70 105 M100 100 L142 99"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.3"
            />
            {/* Trees */}
            <circle cx="50" cy="55" r="6" fill="currentColor" opacity="0.25" />
            <circle cx="155" cy="55" r="5" fill="currentColor" opacity="0.25" />
            <circle cx="40" cy="130" r="7" fill="currentColor" opacity="0.25" />
            <circle cx="160" cy="130" r="6" fill="currentColor" opacity="0.25" />
            <circle cx="100" cy="140" r="5" fill="currentColor" opacity="0.25" />
            <circle cx="65" cy="145" r="4" fill="currentColor" opacity="0.2" />
            <circle cx="140" cy="148" r="5" fill="currentColor" opacity="0.2" />
          </g>

          {/* ─── Zone highlights ─── */}
          <AnimatePresence>
            {activeZones.map((zone) => {
              const shape = ZONE_SHAPES[zone.zoneId]
              if (!shape) return null
              const style = KIND_STYLE[zone.kind]
              const isZoneHovered = hoveredZone === zone.zoneId
              return (
                <motion.g
                  key={`zone-${zone.zoneId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHoveredZone(zone.zoneId)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="cursor-pointer"
                >
                  {shape.type === "rect" ? (
                    <rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      rx={shape.rx ?? 0}
                      fill={style.fill}
                      fillOpacity={isZoneHovered ? 0.35 : 0.2}
                      stroke={style.fill}
                      strokeWidth={isZoneHovered ? 2 : 1.5}
                      strokeOpacity={0.7}
                      strokeDasharray={isZoneHovered ? "none" : "4 2"}
                      className="transition-all duration-200"
                    />
                  ) : (
                    <path
                      d={shape.d}
                      fill={style.fill}
                      fillOpacity={isZoneHovered ? 0.35 : 0.2}
                      stroke={style.fill}
                      strokeWidth={isZoneHovered ? 2 : 1.5}
                      strokeOpacity={0.7}
                      strokeDasharray={isZoneHovered ? "none" : "4 2"}
                      className="transition-all duration-200"
                    />
                  )}

                  {/* Zone label on hover */}
                  {isZoneHovered && (
                    <ZoneTooltip shape={shape} label={zone.label} fill={style.fill} />
                  )}
                </motion.g>
              )
            })}
          </AnimatePresence>

          {/* ─── Markers ─── */}
          <AnimatePresence>
            {markers.map((marker) => {
              const style = KIND_STYLE[marker.kind]
              const isHovered = hoveredSlug === marker.slug
              return (
                <motion.g
                  key={`${marker.kind}-${marker.slug}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                  onMouseEnter={() => setHoveredSlug(marker.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  className="cursor-pointer"
                >
                  {/* Pulse ring */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isHovered ? 10 : 7}
                    fill={style.fill}
                    opacity={0.15}
                    className="transition-all duration-200"
                  />
                  {/* Pin */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isHovered ? 5 : 4}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth="1.5"
                    className="transition-all duration-200"
                  />
                  {/* Inner dot */}
                  <circle cx={marker.x} cy={marker.y} r="1.5" fill="white" />

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={marker.x - 30}
                        y={marker.y - 22}
                        width="60"
                        height="14"
                        rx="3"
                        fill={style.fill}
                      />
                      <text
                        x={marker.x}
                        y={marker.y - 12.5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="5.5"
                        fontWeight="600"
                        fontFamily="system-ui, sans-serif"
                      >
                        {marker.label.length > 16 ? marker.label.slice(0, 14) + "…" : marker.label}
                      </text>
                    </g>
                  )}
                </motion.g>
              )
            })}
          </AnimatePresence>
        </svg>

        {/* Empty state overlay */}
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[10px] text-muted-foreground/50 text-center px-4 leading-tight">
              Les éléments sélectionnés apparaîtront ici sur le plan
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      {hasContent && (
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {(["activite", "espace", "hebergement"] as const).map((kind) => {
            if (!activeKinds.has(kind) && !activeZones.some((z) => z.kind === kind)) return null
            const style = KIND_STYLE[kind]
            return (
              <div key={kind} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: style.fill }}
                />
                <span className="text-[10px] text-muted-foreground">{style.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Item count */}
      {hasContent && (
        <p className="text-[10px] text-muted-foreground/50 text-center mt-1">
          {markers.length > 0 && (
            <>
              {markers.length} point{markers.length > 1 ? "s" : ""}
            </>
          )}
          {markers.length > 0 && activeZones.length > 0 && " · "}
          {activeZones.length > 0 && (
            <>
              {activeZones.length} zone{activeZones.length > 1 ? "s" : ""}
            </>
          )}
        </p>
      )}
    </div>
  )
}

/** Compute the center of a zone shape for tooltip positioning */
function ZoneTooltip({
  shape,
  label,
  fill,
}: {
  shape: (typeof ZONE_SHAPES)[string]
  label: string
  fill: string
}) {
  let cx: number
  let cy: number

  if (shape.type === "rect") {
    cx = shape.x + shape.width / 2
    cy = shape.y + shape.height / 2
  } else {
    // Approximate center from path bounding box using first/last M/L coords
    const nums = shape.d.match(/-?\d+\.?\d*/g)?.map(Number) ?? []
    if (nums.length >= 4) {
      const xs = nums.filter((_, i) => i % 2 === 0)
      const ys = nums.filter((_, i) => i % 2 === 1)
      cx = (Math.min(...xs) + Math.max(...xs)) / 2
      cy = (Math.min(...ys) + Math.max(...ys)) / 2
    } else {
      cx = 100
      cy = 100
    }
  }

  const truncated = label.length > 16 ? label.slice(0, 14) + "…" : label
  return (
    <g>
      <rect x={cx - 30} y={cy - 7} width="60" height="14" rx="3" fill={fill} />
      <text
        x={cx}
        y={cy + 3}
        textAnchor="middle"
        fill="white"
        fontSize="5.5"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {truncated}
      </text>
    </g>
  )
}
