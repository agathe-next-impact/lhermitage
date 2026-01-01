import type { WPPage, MenuItem } from "./types"
import { transformWordPressUrl } from "./url-transform"

export function buildMenuTree(pages: WPPage[]): MenuItem[] {
  // Convert pages to menu items
  const menuItems: MenuItem[] = pages.map((page) => ({
    id: page.id,
    title: page.title.rendered,
    slug: page.slug,
    url: transformWordPressUrl(page.link) || `/${page.slug}`,
    parent: page.parent,
  }))

  // Build tree structure
  const menuMap = new Map<number, MenuItem>()
  const rootItems: MenuItem[] = []

  // First pass: create map
  menuItems.forEach((item) => {
    menuMap.set(item.id, { ...item, children: [] })
  })

  // Second pass: build tree
  menuItems.forEach((item) => {
    const menuItem = menuMap.get(item.id)!

    if (item.parent === 0) {
      rootItems.push(menuItem)
    } else {
      const parent = menuMap.get(item.parent)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(menuItem)
      }
    }
  })

  rootItems.reverse()
  rootItems.forEach((item) => {
    if (item.children) {
      item.children.reverse()
    }
  })

  return rootItems
}

export function findPageInMenu(menu: MenuItem[], slug: string): MenuItem | null {
  for (const item of menu) {
    if (item.slug === slug) {
      return item
    }
    if (item.children) {
      const found = findPageInMenu(item.children, slug)
      if (found) return found
    }
  }
  return null
}
