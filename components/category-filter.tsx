"use client"

import { useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
}

interface CategoryFilterProps {
  categories: Category[]
  onCategoryChange: (categorySlug: string | null) => void
  allLabel?: string
  allDescription?: string
  hideDescription?: boolean
}

export function CategoryFilter({ categories, onCategoryChange, allLabel, allDescription, hideDescription }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    onCategoryChange(categorySlug === "all" ? null : categorySlug)
  }

  const allTabs = [
    {
      id: "all",
      name: allLabel || "Toutes les activités",
      slug: "all",
      description: allDescription || "Découvrez toutes nos activités disponibles",
      color: "#2A4A51",
    },
    ...categories,
  ]

  const selectedTab = allTabs.find((tab) => tab.slug === selectedCategory) || allTabs[0]

  return (
    <div className="mb-2 w-full">
      <div className="w-full">
        <div className="flex flex-wrap gap-1">
          {allTabs.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className={`text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition-all hover:shadow-lg ${
                selectedCategory === category.slug ? "shadow-lg" : "opacity-80 hover:opacity-100"
              }`}
              style={{
                backgroundColor: category.color,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Tab content - description card */}
        {!hideDescription && (
          <div
            className="mt-2 rounded-xl p-6 shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: `${selectedTab.color}CC`, // 80% opacity (CC in hex)
            }}
          >
            <h3 className="text-white text-2xl font-bold mb-4">{selectedTab.name}</h3>
            <p className="text-white text-lg leading-relaxed">
              {selectedTab.description || "Aucune description disponible"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
