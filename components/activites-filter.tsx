"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { WPPost, ActiviteACF } from "@/lib/wordpress/types"
import { getCategoryColor } from "@/lib/wordpress/category-colors"

interface ActivitesFilterProps {
  activites: WPPost<ActiviteACF>[]
}

export function ActivitesFilter({ activites }: ActivitesFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // Extract and organize categories
  const activitesByCategory = new Map<number, { name: string; slug: string; activites: WPPost<ActiviteACF>[] }>()

  activites.forEach((activite) => {
    const categories = activite._embedded?.["wp:term"]?.[0] || []

    if (categories.length > 0) {
      const category = categories[0]
      const categoryId = category.id
      const categoryName = category.name
      const categorySlug = category.slug

      if (!activitesByCategory.has(categoryId)) {
        activitesByCategory.set(categoryId, { name: categoryName, slug: categorySlug, activites: [] })
      }
      activitesByCategory.get(categoryId)!.activites.push(activite)
    } else {
      const defaultCategoryId = 0
      const defaultCategoryName = "Toutes nos activités"
      const defaultCategorySlug = "default"
      if (!activitesByCategory.has(defaultCategoryId)) {
        activitesByCategory.set(defaultCategoryId, { name: defaultCategoryName, slug: defaultCategorySlug, activites: [] })
      }
      activitesByCategory.get(defaultCategoryId)!.activites.push(activite)
    }
  })

  const sortedCategories = Array.from(activitesByCategory.entries()).sort((a, b) => a[0] - b[0])

  // Filter activities based on selected category
  const filteredCategories =
    selectedCategory === null
      ? sortedCategories
      : sortedCategories.filter(([categoryId]) => categoryId === selectedCategory)

  return (
    <div className="space-y-8">
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-5 py-2 font-semibold text-white transition-all duration-300 ${
            selectedCategory === null
              ? "bg-[#e75754] shadow-lg shadow-[#e75754]/50 scale-105 ring-4 ring-[#e75754]/30"
              : "bg-[#e75754] hover:opacity-80"
          }`}
        >
          Toutes
        </button>
        {sortedCategories.map(([categoryId, { name, slug }]) => {
          const categoryColor = getCategoryColor(slug)
          return (
            <button
              key={categoryId}
              onClick={() => setSelectedCategory(categoryId)}
              style={{ backgroundColor: categoryColor }}
              className={`rounded-full px-5 py-2 font-semibold text-white transition-all duration-300 ${
                selectedCategory === categoryId
                  ? "shadow-lg scale-105 ring-4"
                  : "hover:opacity-80"
              }`}
            >
              {name}
            </button>
          )
        })}
      </div>

      {/* Filtered Activities */}
      <div className="space-y-16">
        {filteredCategories.map(([categoryId, { name: categoryName, slug: categorySlug, activites: categoryActivites }]) => {
          const categoryColor = getCategoryColor(categorySlug)
          
          return (
            <section key={categoryId}>
              <h2 className="mb-8 font-serif text-3xl font-extrabold uppercase" style={{ color: categoryColor }}>
                {categoryName}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryActivites.map((activite) => (
                  <div
                    key={activite.id}
                    className="group relative h-[320px] overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
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

                    <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-t-3xl p-6 transform translate-y-[calc(100%-100px)] transition-transform duration-700 ease-out group-hover:translate-y-0 z-20 h-full flex flex-col">
                      <div className="flex-shrink-0">
                        <h3 className="text-xl font-bold line-clamp-2" style={{ color: categoryColor }}>
                          {activite.acf?.nom || activite.title.rendered}
                        </h3>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4 flex-grow flex flex-col">
                        {activite.acf?.descriptif && (
                          <div
                            className="prose prose-sm line-clamp-6 text-gray-700 mb-4"
                            dangerouslySetInnerHTML={{ __html: activite.acf.descriptif }}
                          />
                        )}
                        
                        <div className="flex-grow" />
                        
                        <Button
                          asChild
                          className="w-full rounded-full text-white transition-colors mt-auto flex-shrink-0 hover:opacity-90"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <Link href={`/activite/${activite.slug}`}>En savoir plus</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
