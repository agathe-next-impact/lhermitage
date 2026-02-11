"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { WPPost, ActiviteACF } from "@/lib/wordpress/types"
import { getCategoryColor } from "@/lib/wordpress/category-colors"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

interface ActivitesFilterProps {
  activites: WPPost<ActiviteACF>[]
}

export function ActivitesFilter({ activites }: ActivitesFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // Extract and organize categories (memoized — only recomputes when activites prop changes)
  const sortedCategories = useMemo(() => {
    const byCategory = new Map<number, { name: string; slug: string; activites: WPPost<ActiviteACF>[] }>()

    activites.forEach((activite) => {
      const categories = activite._embedded?.["wp:term"]?.[0] || []

      if (categories.length > 0) {
        const category = categories[0]
        const categoryId = category.id

        if (!byCategory.has(categoryId)) {
          byCategory.set(categoryId, { name: category.name, slug: category.slug, activites: [] })
        }
        byCategory.get(categoryId)!.activites.push(activite)
      } else {
        if (!byCategory.has(0)) {
          byCategory.set(0, { name: "Toutes nos activités", slug: "default", activites: [] })
        }
        byCategory.get(0)!.activites.push(activite)
      }
    })

    return Array.from(byCategory.entries()).sort((a, b) => a[0] - b[0])
  }, [activites])

  const filteredCategories = useMemo(
    () =>
      selectedCategory === null
        ? sortedCategories
        : sortedCategories.filter(([categoryId]) => categoryId === selectedCategory),
    [sortedCategories, selectedCategory],
  )

  return (
    <div className="space-y-0">
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-lg px-5 py-2 font-semibold text-white transition-all duration-300 ${
            selectedCategory === null
              ? "bg-[#e75754]"
              : "bg-[#e75754] hover:opacity-80"
          }`}
        >
          Toutes
        </Button>
        {sortedCategories.map(([categoryId, { name, slug }]) => {
          const categoryColor = getCategoryColor(slug)
          return (
            <Button
              key={categoryId}
              onClick={() => setSelectedCategory(categoryId)}
              style={{ backgroundColor: categoryColor }}
              className={`rounded-sm px-5 py-2 font-semibold text-white transition-all duration-300 ${
                selectedCategory === categoryId
                  ? "shadow-lg scale-105"
                  : "hover:opacity-80"
              }`}
            >
              {name}
            </Button>
          )
        })}
      </div>

      {/* Filtered Activities */}
      <div className="space-y-0">
        {filteredCategories.map(([categoryId, { name: categoryName, slug: categorySlug, activites: categoryActivites }]) => {
          const categoryColor = getCategoryColor(categorySlug)
          
          return (
            <div key={categoryId}>
              <h2 className="mb-8 font-serif text-3xl font-extrabold uppercase" style={{ color: categoryColor }}>
                {categoryName}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryActivites.map((activite) => (
                  <div
                    key={activite.id}
                    className="group relative overflow-hidden rounded-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Background Image */}
                    {activite._embedded?.["wp:featuredmedia"]?.[0] && (
                      <div className="absolute inset-0">
                        <Image
                          src={activite._embedded["wp:featuredmedia"][0].source_url || "/placeholder.svg"}
                          alt={activite._embedded["wp:featuredmedia"][0].alt_text || activite.title.rendered}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          quality={70}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-t-lg p-6 transform translate-y-[calc(100%-100px)] transition-transform duration-700 ease-out group-hover:translate-y-0 z-20 h-full flex flex-col">
                      <div className="flex-shrink-0">
                        <h3 className="text-xl font-bold line-clamp-2" style={{ color: categoryColor }}>
                          {activite.acf?.nom || activite.title.rendered}
                        </h3>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4 flex-grow flex flex-col">
                        {activite.acf?.descriptif && (
                          <div
                            className="prose prose-sm line-clamp-6 text-gray-700 mb-4"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(activite.acf.descriptif) }}
                          />
                        )}
                        
                        <div className="flex-grow" />
                        
                        <Button
                          asChild
                          className="w-full rounded-l-lg text-white transition-colors mt-auto flex-shrink-0 hover:opacity-90"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <Link href={`/activite/${activite.slug}`}>En savoir plus</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
