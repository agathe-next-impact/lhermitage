/**
 * Category extraction from WordPress embedded taxonomy terms.
 * Shared by activites, services, evenements, partenaires pages.
 */
import type { WPPost } from "@/lib/wordpress/types"
import { getCategoryColorByIndex } from "@/lib/wordpress/category-colors"

export interface ExtractedCategory {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

/**
 * Extract unique categories from embedded taxonomy terms on an array of posts.
 * Returns categories with auto-assigned colors.
 */
export function extractCategories(
  posts: WPPost<any>[],
  descriptionPrefix = ""
): ExtractedCategory[] {
  const categoriesMap = new Map<
    string,
    { id: string; name: string; slug: string; description: string }
  >()

  posts.forEach((post) => {
    const categoryData = post._embedded?.["wp:term"]?.[0]?.[0]
    if (categoryData) {
      if (!categoriesMap.has(categoryData.slug)) {
        categoriesMap.set(categoryData.slug, {
          id: categoryData.id.toString(),
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || `${descriptionPrefix}${categoryData.name}`,
        })
      }
    }
  })

  return Array.from(categoriesMap.values()).map((cat, index) => ({
    ...cat,
    color: getCategoryColorByIndex(index),
  }))
}

/**
 * Get the category slug for a given post from embedded terms.
 */
export function getPostCategorySlug(post: WPPost<any>): string | undefined {
  return post._embedded?.["wp:term"]?.[0]?.[0]?.slug
}
