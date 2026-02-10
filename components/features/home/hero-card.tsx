import Image from "next/image"
import Link from "next/link"
import { getCategoryColor } from "@/lib/wordpress/category-colors"
import { cn } from "@/lib/utils"

interface HeroCardProps {
  title: string
  subtitle?: string
  description?: string
  image?: string
  imageAlt?: string
  imageFit?: "cover" | "contain"
  link?: string
  linkText?: string
  className?: string
  category?: string
  categorySlug?: string
}

export function HeroCard({
  title,
  subtitle,
  description,
  image,
  imageAlt = "Card image",
  imageFit = "cover",
  link,
  linkText = "En savoir plus",
  className = "",
  category,
  categorySlug,
}: HeroCardProps) {
  const categoryColor = getCategoryColor(categorySlug)

  const cardContent = (
    <div
      className={`group relative h-[320px] w-full overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl bg-white ${
        link ? "cursor-pointer" : ""
      } ${className}`}
    >
      {image && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            alt={imageAlt}
            className={cn("transition-transform duration-700 group-hover:scale-105", {
              "object-cover": imageFit === "cover",
              "object-contain object-top p-8": imageFit === "contain",
            })}
            src={image || "/placeholder.svg"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={70}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQFESExBhJBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Am8gF8fiYZppJIxJcSMXaRyWJIA5J5NVvG8tcXEomMkgkRA25J2T1xSlB/9k="
          />
          {imageFit === "cover" && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          )}
        </div>
      )}

      {category && categorySlug && (
        <span
          style={{ backgroundColor: categoryColor }}
          className="text-white text-xs font-semibold px-3 py-1.5 rounded-full absolute top-4 left-4 shadow-md z-20"
        >
          {category}
        </span>
      )}

      {link && (
        <div className="absolute top-4 right-4 z-20">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white opacity-70 group-hover:opacity-100 transition-opacity"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md rounded-t-2xl p-6 transform translate-y-[calc(100%-120px)] transition-transform duration-700 ease-out group-hover:translate-y-0 z-20 h-full flex flex-col">
        <div className="flex-shrink-0">
          {subtitle && <p className="text-sm uppercase font-bold text-[#E75754] mb-2">{subtitle}</p>}
          <h4 className="font-bold text-2xl leading-tight" style={{ color: categoryColor }}>
            {title}
          </h4>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4 flex-grow flex flex-col">
          {description && <p className="text-base text-gray-600 line-clamp-4 mb-4">{description}</p>}

          <div className="flex-grow" />

          {link && (
            <p className="text-sm font-semibold flex items-center gap-2 mt-auto" style={{ color: categoryColor }}>
              {linkText}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (link) {
    return (
      <Link href={link} className="block" prefetch={false}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
