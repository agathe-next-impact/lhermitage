"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'
import type { WPPost, SejourACF } from "@/lib/wordpress/types"

interface SejourPricingCardProps {
  sejour: WPPost<SejourACF>
  featured?: boolean
}

export function SejourPricingCard({ sejour, featured = false }: SejourPricingCardProps) {
  if (!sejour || !sejour.id) {
    return null
  }

  const colorClasses = featured
    ? "border-[#E75754] shadow-2xl shadow-[#E75754]/20"
    : "border-border hover:border-[#56939F] hover:shadow-xl"

  const getTitle = (item: any): string => {
    try {
      // Si l'item a directement un title.rendered (c'est un objet WordPress complet)
      if (item?.title?.rendered) {
        return item.title.rendered
      }
      // Si c'est juste un objet avec acf.nom
      if (item?.acf?.nom) {
        return item.acf.nom
      }
      // Si c'est juste un objet avec title string
      if (typeof item?.title === 'string') {
        return item.title
      }
    } catch (error) {
      // silently fall through to default
    }
    return "Sans titre"
  }

  const getSlug = (item: any): string | null => {
    try {
      return item?.slug || null
    } catch (error) {
      // silently fall through to default
      return null
    }
  }

  const getDescriptionExcerpt = (html: string | undefined, maxLength: number = 150): string => {
    try {
      if (!html || typeof html !== 'string') return ""
      // Remove HTML tags
      const text = html.replace(/<[^>]*>/g, '')
      // Decode HTML entities
      const decoded = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      // Truncate and add ellipsis if needed
      if (decoded.length > maxLength) {
        return decoded.substring(0, maxLength).trim() + '...'
      }
      return decoded.trim()
    } catch (error) {
      // silently fall through to default
      return ""
    }
  }

  const featuredImage = sejour._embedded?.["wp:featuredmedia"]?.[0]
  const imageUrl = featuredImage?.source_url || "/placeholder.svg?height=200&width=400"
  const imageAlt = featuredImage?.alt_text || sejour.title?.rendered || "Image du séjour"

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 ${colorClasses} ${
        featured ? "scale-105" : ""
      }`}
    >
      {/* Badge "Populaire" si featured */}
      {featured && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-[#E75754] px-4 py-1 text-sm font-bold uppercase text-white shadow-lg">
          Populaire
        </div>
      )}

      {/* Image header */}
      {featuredImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            quality={70}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-8">
        {/* Titre */}
        <h3 className="mb-4 font-heading text-2xl font-extrabold uppercase text-[#535353]">
          {sejour.acf?.nom || sejour.title?.rendered || "Séjour"}
        </h3>

        {sejour.acf?.descriptif && (
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {getDescriptionExcerpt(sejour.acf.descriptif, 150)}
          </p>
        )}

        {sejour.acf?.hebergements?.hebergements && 
         Array.isArray(sejour.acf.hebergements.hebergements) && 
         sejour.acf.hebergements.hebergements.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#56939F]">
              {sejour.acf.hebergements.titre || "Hébergements"}
            </h4>
            <ul className="space-y-2">
              {sejour.acf.hebergements.hebergements.slice(0, 3).map((item, index) => {
                const title = getTitle(item?.hebergement)
                const slug = getSlug(item?.hebergement)
                
                return (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#78AD7D]" />
                    {slug ? (
                      <Link
                        href={`/hebergement/${slug}`}
                        className="text-[#535353] hover:text-[#56939F] hover:underline transition-colors"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="text-[#535353]">{title}</span>
                    )}
                  </li>
                )
              })}
              {sejour.acf.hebergements.hebergements.length > 3 && (
                <li className="text-sm text-muted-foreground">
                  +{sejour.acf.hebergements.hebergements.length - 3} autres hébergements
                </li>
              )}
            </ul>
          </div>
        )}

        {sejour.acf?.activites?.activite && 
         Array.isArray(sejour.acf.activites.activite) && 
         sejour.acf.activites.activite.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#DC6F45]">
              {sejour.acf.activites.titre || "Activités"}
            </h4>
            <ul className="space-y-2">
              {sejour.acf.activites.activite.slice(0, 3).map((item, index) => {
                const title = getTitle(item?.activite)
                const slug = getSlug(item?.activite)
                
                return (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#78AD7D]" />
                    {slug ? (
                      <Link
                        href={`/activite/${slug}`}
                        className="text-[#535353] hover:text-[#DC6F45] hover:underline transition-colors"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="text-[#535353]">{title}</span>
                    )}
                  </li>
                )
              })}
              {sejour.acf.activites.activite.length > 3 && (
                <li className="text-sm text-muted-foreground">
                  +{sejour.acf.activites.activite.length - 3} autres activités
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* CTA Button */}
        {sejour.slug && (
          <Link href={`/sejour/${sejour.slug}`} className="mt-6">
            <Button
              className={`w-full rounded-full text-white transition-all duration-300 ${
                featured
                  ? "bg-[#E75754] hover:bg-[#E75754]/90 shadow-lg hover:shadow-xl"
                  : "bg-[#56939F] hover:bg-[#56939F]/90"
              }`}
              size="lg"
            >
              Découvrir ce séjour
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
