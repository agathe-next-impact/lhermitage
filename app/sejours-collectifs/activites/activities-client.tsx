"use client"

import { useState } from "react"
import { CategoryFilter } from "@/components/category-filter"
import { HeroCard } from "@/components/hero-card"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
}

interface Activity {
  id: number
  title: string
  description?: string
  image?: string
  imageAlt?: string
  slug: string
  categoryName?: string
  categorySlug?: string
}

interface ActivitiesClientProps {
  categories: Category[]
  activities: Activity[]
}

export function ActivitiesClient({ categories, activities }: ActivitiesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter activities based on selected category
  const filteredActivities = selectedCategory
    ? activities.filter((activity) => activity.categorySlug === selectedCategory)
    : activities

  // Group activities by category for display
  const activitiesByCategory = filteredActivities.reduce(
    (acc, activity) => {
      const categoryName = activity.categoryName || "Sans catégorie"

      if (!acc[categoryName]) {
        acc[categoryName] = {
          slug: activity.categorySlug || "sans-categorie",
          activities: [],
        }
      }

      acc[categoryName].activities.push(activity)
      return acc
    },
    {} as Record<string, { slug: string; activities: Activity[] }>,
  )

  const sortedCategories = Object.keys(activitiesByCategory).sort().reverse()

  return (
    <>
      <CategoryFilter categories={categories} onCategoryChange={setSelectedCategory} />

      {sortedCategories.map((categoryName) => {
        const categoryData = activitiesByCategory[categoryName]

        return (
          <div key={categoryName} className="mb-16">
            <h2 className="mb-8 font-serif text-3xl font-extrabold uppercase">{categoryName}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryData.activities.map((activity) => (
                <HeroCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  image={activity.image}
                  imageAlt={activity.imageAlt}
                  link={`/activite/${activity.slug}`}
                  linkText="En savoir plus"
                  category={activity.categoryName}
                  categorySlug={activity.categorySlug}
                />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
