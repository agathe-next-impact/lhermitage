"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, LayoutGroup } from "framer-motion"
import Image from "next/image"
import { CategoryFilter } from "@/components/category-filter"
import { truncateText } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
}

interface Service {
  id: number
  title: string
  description?: string
  descriptionHtml?: string
  image?: string
  imageAlt?: string
  slug: string
  categoryName?: string
  categorySlug?: string
  contentImages?: { src: string; alt: string }[]
}

interface ServicesClientProps {
  categories: Category[]
  services: Service[]
}

const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 267'%3E%3Crect fill='%23d4d4d4' width='400' height='267'/%3E%3C/svg%3E"

const ALLOWED_IMAGE_HOSTS = ["admin.hermitagelelab.com", "wp-asso.com"]

function isOptimizableUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_IMAGE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

/* ── Collapsed card ── */

const CollapsedCard: React.FC<{
  service: Service
  color: string
  isPriority: boolean
  onExpand: () => void
}> = ({ service, color, isPriority, onExpand }) => {
  const description = service.description
    ? truncateText(service.description, 120)
    : ""

  return (
    <motion.div
      layoutId={`svc-card-${service.id}`}
      data-service-card
      className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md rounded-xl overflow-hidden relative cursor-pointer"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
      onClick={onExpand}
    >
      <div className="px-2 pb-6">
        <motion.h3
          layoutId={`svc-title-${service.id}`}
          className="text-xl font-bold mb-3 text-white"
        >
          {service.title}
        </motion.h3>
        <p className="text-white/80 text-sm mb-4 line-clamp-4">{description}</p>

        <span
          className="inline-flex items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 shadow-sm text-xs h-8 px-4 font-medium"
        >
          Découvrir
        </span>
      </div>
      {service.image && (
        <motion.div layoutId={`svc-image-${service.id}`}>
          <Image
            src={service.image}
            alt={service.imageAlt || service.title}
            width={400}
            height={267}
            quality={60}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={isPriority}
            loading={isPriority ? undefined : "lazy"}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="rounded-xl object-cover w-full h-48"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

/* ── Expanded card ── */

function stripImagesFromHtml(html: string): string {
  return html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<p[^>]*>\s*<img[^>]*>\s*<\/p>/gi, "")
    .replace(/<img[^>]*>/gi, "")
}

const ExpandedCard: React.FC<{
  service: Service
  color: string
  onCollapse: () => void
}> = ({ service, color, onCollapse }) => {
  const cleanDescriptionHtml = service.descriptionHtml
    && service.contentImages && service.contentImages.length > 0
    ? stripImagesFromHtml(service.descriptionHtml)
    : service.descriptionHtml

  return (
    <motion.div
      layoutId={`svc-card-${service.id}`}
      className="flex flex-col p-2 pt-6 shadow-lg rounded-xl overflow-hidden relative"
      style={{ backgroundColor: color }}
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
    >
      <motion.button
        onClick={onCollapse}
        className="absolute top-3 right-3 z-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors p-1.5"
        aria-label="Fermer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        <X className="w-5 h-5 text-white" />
      </motion.button>

      <div className="flex flex-col lg:flex-row gap-6 px-2 pb-6">
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <motion.h3
            layoutId={`svc-title-${service.id}`}
            className="text-2xl font-bold mb-4 text-white"
          >
            {service.title}
          </motion.h3>

          <div className="bg-white/70 rounded-xl p-5">
            {cleanDescriptionHtml ? (
              <motion.div
                className="prose prose-sm max-w-none [&_p]:text-stone-700 [&_a]:underline"
                style={{ "--tw-prose-links": color } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanDescriptionHtml) }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              />
            ) : service.description ? (
              <motion.p
                className="text-stone-700 text-sm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              >
                {service.description}
              </motion.p>
            ) : null}
          </div>
        </div>

        {(service.image || (service.contentImages && service.contentImages.length > 0)) && (
          <div className="lg:w-1/2 flex flex-col gap-2">
            {service.image && (
              <motion.div layoutId={`svc-image-${service.id}`}>
                <Image
                  src={service.image}
                  alt={service.imageAlt || service.title}
                  width={640}
                  height={400}
                  quality={75}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-xl object-cover w-full h-64 lg:h-72"
                />
              </motion.div>
            )}
            {service.contentImages && service.contentImages.length > 0 && (
              <motion.div
                className="grid grid-cols-3 gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2, duration: 0.35 }}
              >
                {service.contentImages.slice(0, 3).map((img, i) =>
                  isOptimizableUrl(img.src) ? (
                    <Image
                      key={i}
                      src={img.src}
                      alt={img.alt || `Photo ${i + 1}`}
                      width={200}
                      height={133}
                      sizes="(max-width: 1024px) 33vw, 16vw"
                      quality={60}
                      loading="lazy"
                      className="rounded-lg object-cover w-full h-24 lg:h-28"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img.src}
                      alt={img.alt || `Photo ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="rounded-lg object-cover w-full h-24 lg:h-28"
                    />
                  )
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Grid ── */

export function ServicesClient({ categories, services }: ServicesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollYBeforeExpand = useRef<number>(0)

  const filteredServices = selectedCategory
    ? services.filter((s) => s.categorySlug === selectedCategory)
    : services

  const servicesByCategory = filteredServices.reduce(
    (acc, service) => {
      const categoryName = service.categoryName || "Sans catégorie"

      if (!acc[categoryName]) {
        acc[categoryName] = {
          slug: service.categorySlug || "sans-categorie",
          services: [],
        }
      }

      acc[categoryName].services.push(service)
      return acc
    },
    {} as Record<string, { slug: string; services: Service[] }>
  )

  const categoryOrder = categories.map((c) => c.name)
  const sortedCategories = Object.keys(servicesByCategory).sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? Infinity : categoryOrder.indexOf(a)) - (categoryOrder.indexOf(b) === -1 ? Infinity : categoryOrder.indexOf(b))
  )

  const smoothScrollTo = useCallback((target: number, duration = 600) => {
    const start = window.scrollY
    const delta = target - start
    if (Math.abs(delta) < 1) return
    const startTime = performance.now()

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
    }

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, start + delta * easeInOutCubic(progress))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [])

  const handleExpand = useCallback((id: number) => {
    setExpandedId((prev) => {
      if (prev === id) return prev
      if (prev === null) {
        scrollYBeforeExpand.current = window.scrollY
      }
      return id
    })
  }, [])

  const handleCollapse = useCallback(() => {
    const scrollTarget = scrollYBeforeExpand.current
    setExpandedId(null)
    setTimeout(() => {
      smoothScrollTo(scrollTarget, 500)
    }, 300)
  }, [smoothScrollTo])

  useEffect(() => {
    if (expandedId === null) return
    const timer = setTimeout(() => {
      const el = document.getElementById(`expanded-${expandedId}`)
      if (el) {
        const targetY = el.getBoundingClientRect().top + window.scrollY - 50
        smoothScrollTo(targetY, 250)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [expandedId, smoothScrollTo])

  useEffect(() => {
    if (expandedId === null) return
    function handleClickOutside(e: MouseEvent) {
      const el = document.getElementById(`expanded-${expandedId}`)
      const target = e.target as HTMLElement
      if (target.closest("[data-service-card]")) return
      if (el && !el.contains(target)) {
        handleCollapse()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expandedId, handleCollapse])

  useEffect(() => {
    setExpandedId(null)
  }, [selectedCategory])

  /** Assign a color to each category based on its position */
  const categoryColors: Record<string, string> = {}
  const PALETTE = ["#E75754", "#56939F", "#78AD7D", "#C14C66", "#DC6F45", "#2A4A51"]
  categories.forEach((cat, i) => {
    categoryColors[cat.slug] = cat.color || PALETTE[i % PALETTE.length]
  })
  function getColor(slug?: string): string {
    if (!slug) return PALETTE[0]
    return categoryColors[slug] || PALETTE[0]
  }

  return (
    <>
      <CategoryFilter
        categories={categories}
        onCategoryChange={setSelectedCategory}
        allLabel="Tous les services"
        allDescription="Découvrez tous nos services disponibles"
      />

      {sortedCategories.map((categoryName, catIndex) => {
        const categoryData = servicesByCategory[categoryName]
        const color = getColor(categoryData.slug)
        const prevCount = sortedCategories
          .slice(0, catIndex)
          .reduce((sum, cn) => sum + servicesByCategory[cn].services.length, 0)

        return (
          <div key={categoryName} className="mb-2">
            <LayoutGroup id={`svc-category-${categoryData.slug}`}>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {categoryData.services.map((service, svcIndex) => {
                  const isExpanded = service.id === expandedId
                  const globalIndex = prevCount + svcIndex

                  if (isExpanded) {
                    return (
                      <motion.div
                        key={service.id}
                        id={`expanded-${service.id}`}
                        layout
                        className="col-span-1 md:col-span-2 lg:col-span-3"
                        transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <ExpandedCard
                          service={service}
                          color={color}
                          onCollapse={handleCollapse}
                        />
                      </motion.div>
                    )
                  }

                  return (
                    <motion.div
                      key={service.id}
                      layout
                      animate={{
                        filter: expandedId !== null ? "opacity(0.7)" : "opacity(1)",
                      }}
                      transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, duration: 0.3 }}
                    >
                      <CollapsedCard
                        service={service}
                        color={color}
                        isPriority={globalIndex < 3}
                        onExpand={() => handleExpand(service.id)}
                      />
                    </motion.div>
                  )
                })}

                {/* Bento filler — md (2-col) */}
                {expandedId === null && categoryData.services.length % 2 !== 0 && (
                  <div
                    className="hidden md:flex lg:hidden rounded-xl relative overflow-hidden items-end justify-end p-4"
                    style={{ backgroundColor: color }}
                  >
                    <Image
                      src="/logo-hermitage-new.png"
                      alt="L'Hermitage"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Bento filler — lg (3-col) */}
                {expandedId === null && (() => {
                  const lgRemaining = (3 - (categoryData.services.length % 3)) % 3
                  if (lgRemaining === 0) return null
                  const logoSize = lgRemaining === 2 ? 240 : 120
                  return (
                    <div
                      className={`hidden lg:flex rounded-xl relative overflow-hidden items-end justify-end p-4 ${
                        lgRemaining === 2 ? "lg:col-span-2" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      <Image
                        src="/logo-hermitage-new.png"
                        alt="L'Hermitage"
                        width={logoSize}
                        height={logoSize}
                        className="object-contain"
                      />
                    </div>
                  )
                })()}
              </div>
            </LayoutGroup>
          </div>
        )
      })}
    </>
  )
}
