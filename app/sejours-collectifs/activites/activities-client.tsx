"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CategoryFilter } from "@/components/category-filter"
import { MinimalCard } from "@/components/ui/minimal-card"
import { getCategoryColor } from "@/lib/wordpress/category-colors"
import { truncateText } from "@/lib/utils"

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
    {} as Record<string, { slug: string; activities: Activity[] }>
  )

  const sortedCategories = Object.keys(activitiesByCategory).sort().reverse()

  return (
    <>
      <CategoryFilter categories={categories} onCategoryChange={setSelectedCategory} />

      {sortedCategories.map((categoryName) => {
        const categoryData = activitiesByCategory[categoryName]

        const color = getCategoryColor(categoryData.slug)

        return (
          <div key={categoryName} className="mb-2">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {categoryData.activities.map((activity) => {
                const description = activity.description
                  ? truncateText(activity.description, 120)
                  : ""

                return (
                  <MinimalCard
                    key={activity.id}
                    className="h-full flex flex-col justify-between p-2 pt-6 shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: color }}
                  >
                    <div className="px-2 pb-6">
                      <h3 className="text-xl font-bold mb-3 text-white">{activity.title}</h3>
                      <p className="text-white/80 text-sm mb-4 line-clamp-4">{description}</p>

                      <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 shadow-sm text-xs h-8 px-4"
                      >
                        <Link href={`/activite/${activity.slug}`}>Découvrir</Link>
                      </Button>
                    </div>
                    {activity.image && (
                      <div>
                        <Image
                          src={activity.image}
                          alt={activity.imageAlt || activity.title}
                          width={600}
                          height={400}
                          quality={100}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="rounded-xl object-cover w-full h-48"
                        />
                      </div>
                    )}
                  </MinimalCard>
                )
              })}

              {/* Bento filler — md (2-col) */}
              {categoryData.activities.length % 2 !== 0 && (
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
              {(() => {
                const lgRemaining = (3 - (categoryData.activities.length % 3)) % 3
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
          </div>
        )
      })}
    </>
  )
}
