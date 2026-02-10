"use client"
import { motion } from "framer-motion"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { getColorForPath } from "@/lib/page-colors"

interface PageHeaderProps {
  title: string
  subtitle?: string
  image?: unknown
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

function getMainBlobColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash = hash & hash
  }
  const index = Math.abs(hash) % brandColors.length
  return brandColors[index]
}

export function PageHeader({ title, subtitle, className = "", color }: PageHeaderProps) {
  const pathname = usePathname()
  const colorFromPath = useMemo(() => {
    if (color) return color
    return getColorForPath(pathname)
  }, [pathname, color])

  const mainBlobColor = colorFromPath || getMainBlobColor(title)


  return (
    <div className={`relative h-[40vh] md:h-[50vh] w-full overflow-visible -mt-16 ${className}`}>
      {/* Animated SVG Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Base background color */}
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'transparent' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Layer 1 - progressive reveal left to right */}
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: 'inset(0 0 0 100%)' }}
          animate={{ clipPath: 'inset(0 0 0 0%)' }}
          transition={{ duration: 1.15, ease: 'easeOut', delay: 0.3 }}
        >
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMin slice"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#c14c66"
              d="M726.01,267.03s-49.68-17.08-63.65-57.44c-8.16-23.56-30.28-45.11-54.04-52.14-42.94-12.7-91.77,17.9-131.18-5.77-13.12-7.88-24.22-18.72-37.07-27.02-21.11-13.63-46.72-11.61-70.63-10.08-19.51,1.25-40.51,3.23-59.37-3.2-22.96-7.82-44.24-25.07-58.74-44.33-6.65-8.83-11.98-18.66-15.27-29.23C235.02,34.52,229.07,0,232.84,0c.03,0,486.96,0,486.96,0l6.21,267.03Z"
            />
          </svg>
        </motion.div>
        {/* Layer 2 - progressive reveal right to left */}
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 1.15, ease: 'easeOut', delay: 0.5 }}
        >
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMin slice"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#e75754"
              d="M590.5-2c-1.43,0-13.65,15.9-15.36,17.41-15.84,14.02-35.97,23.73-57,29.82-54,15.63-103.2.78-157.46,2.42-47.75,1.45-96.61,15.88-129.86,47.94-28.19,27.19-41.41,66.45-73.87,90.03-36.26,26.34-94.41,39.46-140.48,39.95-23.71.25-47.46-3.62-69.28-12.07-11.47-4.44-58.7-25.41-58.7-38.79,0-.01,0-173.32,0-173.32,0,0,701.28-3.4,702-3.4Z"
            />
          </svg>
        </motion.div>
      </div>

      {/* Title blob */}
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
    </div>
  )
}

export default PageHeader
