"use client"
import { motion } from "framer-motion"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { getColorForPath } from "@/lib/page-colors"

interface PageHeaderProps {
  title: string
  subtitle?: string
  image?:
    | {
        url: string
        alt?: string
      }
    | string
  className?: string
  color?: string
}

const brandColors = [
  "#E75754", // Coral/Red
  "#56939F", // Teal
  "#78AD7D", // Green
  "#C14C66", // Pink
  "#DC6F45", // Orange
]

interface WhiteCircleConfig {
  size: number // Width/height in pixels
  opacity: number
  position: { top?: string; bottom?: string; left?: string; right?: string }
  absolutePosition: { x: number; y: number } // Absolute position in percentage
  delay: number
  duration: number
  rotation: number // Random rotation for variety
}

function getMainBlobColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }
  const index = Math.abs(hash) % brandColors.length
  return brandColors[index]
}

function checkCollision(
  circle1: { x: number; y: number; size: number },
  circle2: { x: number; y: number; size: number },
  minDistance = 30,
): boolean {
  // Convert percentage positions to pixel space for accurate distance calculation
  // Assuming header is roughly 1200px wide and 400px tall (approximate viewport)
  const headerWidth = 1200
  const headerHeight = 400

  const x1 = (circle1.x / 100) * headerWidth
  const y1 = (circle1.y / 100) * headerHeight
  const x2 = (circle2.x / 100) * headerWidth
  const y2 = (circle2.y / 100) * headerHeight

  const dx = x1 - x2
  const dy = y1 - y2
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Calculate radii in pixels
  const radius1 = circle1.size / 2
  const radius2 = circle2.size / 2

  // Minimum distance is the sum of both radii plus the required 30px gap
  const minRequired = radius1 + radius2 + minDistance

  return distance < minRequired
}

function getWhiteCircles(title: string): WhiteCircleConfig[] {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }

  const random = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed + hash) * 10000
    return min + (x - Math.floor(x)) * (max - min)
  }

  const count = Math.floor(random(1, 2, 4))
  const circles: WhiteCircleConfig[] = []

  const placedCircles: { x: number; y: number; size: number }[] = []

  const gridCols = 4
  const gridRows = 3
  const cellWidth = 100 / gridCols
  const cellHeight = 100 / gridRows

  const potentialPositions: Array<{ cellX: number; cellY: number }> = []
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      potentialPositions.push({ cellX: col, cellY: row })
    }
  }

  for (let i = potentialPositions.length - 1; i > 0; i--) {
    const j = Math.floor(random(i * 100, 0, i + 1))
    ;[potentialPositions[i], potentialPositions[j]] = [potentialPositions[j], potentialPositions[i]]
  }

  let positionIndex = 0

  while (circles.length < count && positionIndex < potentialPositions.length) {
    const { cellX, cellY } = potentialPositions[positionIndex]
    positionIndex++

    const x = cellX * cellWidth + random(positionIndex * 10, cellWidth * 0.2, cellWidth * 0.8)
    const y = cellY * cellHeight + random(positionIndex * 20, cellHeight * 0.2, cellHeight * 0.8)

    const size = random(positionIndex * 30, 60, 150)
    const opacity = random(positionIndex * 40, 0.7, 1.0)
    const delay = random(positionIndex * 50, 0.3, 1.2)
    const duration = random(positionIndex * 60, 0.8, 1.5)
    const rotation = random(positionIndex * 70, -45, 45)

    let hasCollision = false

    for (const placed of placedCircles) {
      if (checkCollision({ x, y, size }, placed, 30)) {
        hasCollision = true
        break
      }
    }

    if (!hasCollision) {
      let position: WhiteCircleConfig["position"]

      if (x < 50 && y < 50) {
        position = { top: `${y}%`, left: `${x}%` }
      } else if (x >= 50 && y < 50) {
        position = { top: `${y}%`, right: `${100 - x}%` }
      } else if (x < 50 && y >= 50) {
        position = { bottom: `${100 - y}%`, left: `${x}%` }
      } else {
        position = { bottom: `${100 - y}%`, right: `${100 - x}%` }
      }

      circles.push({
        size,
        opacity,
        position,
        absolutePosition: { x, y },
        delay,
        duration,
        rotation,
      })

      placedCircles.push({ x, y, size })
    }
  }

  return circles
}

export function PageHeader({ title, subtitle, image, className = "", color }: PageHeaderProps) {
  const pathname = usePathname()
  const colorFromPath = useMemo(() => {
    if (color) return color
    return getColorForPath(pathname)
  }, [pathname, color])

  const mainBlobColor = colorFromPath || getMainBlobColor(title)

  const whiteCircles = useMemo(() => getWhiteCircles(title), [title])

  const imageUrl = typeof image === "string" ? image : image?.url
  const imageAlt = typeof image === "string" ? title : image?.alt || title

  return (
    <div className={`relative h-[40vh] md:h-[50vh] w-full overflow-visible -mt-16 ${className}`}>
      {imageUrl ? (
        <>
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 z-[1]" />

          {whiteCircles.map((circle, index) => (
            <motion.img
              key={`white-circle-${index}`}
              src="/images/design-mode/Fichier%205%404x-8.png"
              alt=""
              className="absolute z-[1] pointer-events-none hidden md:block"
              style={{
                ...circle.position,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                transform: `rotate(${circle.rotation}deg)`,
              }}
              initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
              animate={{ opacity: circle.opacity, clipPath: "circle(100% at 50% 50%)" }}
              transition={{
                duration: circle.duration,
                ease: "easeOut",
                delay: circle.delay,
              }}
            />
          ))}

          <motion.div
            key={`blob-container-${title}`}
            className="absolute left-[5%] sm:left-[8%] md:left-[13%] lg:left-[15%] z-20"
            style={{
              bottom: "-60px",
              width: "clamp(280px, 80vw, 500px)",
              height: "clamp(120px, 25vw, 200px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="absolute left-0 top-0 w-full h-full"
              style={{
                maskImage: "url(/images/titre-page-blob.svg)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "left center",
                WebkitMaskImage: "url(/images/titre-page-blob.svg)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "left center",
                backgroundColor: mainBlobColor,
              }}
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(100% at 50% 50%)" }}
              transition={{ duration: 1.15, ease: "easeOut", delay: 0.3 }}
            />

            <motion.div
              key={`blob-text-${title}`}
              className="absolute top-0 left-0 flex h-full items-center pl-4 sm:pl-6 md:pl-12 lg:pl-16 pr-2 overflow-visible"
              style={{ width: "100%" }}
              initial={{ opacity: 0, x: -30, clipPath: "circle(0% at 50% 50%)" }}
              animate={{ opacity: 1, x: 0, clipPath: "circle(100% at 50% 50%)" }}
              transition={{ duration: 1.15, ease: "easeOut", delay: 0.3 }}
            >
              <div className="w-full">
                <h1 className="mb-1 font-sans text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold uppercase text-white leading-tight drop-shadow-sm">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white leading-snug line-clamp-2 md:line-clamp-none">
                    {subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 z-0" />
      )}
    </div>
  )
}

export default PageHeader
