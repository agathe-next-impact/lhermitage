"use client"

import { createContext, useContext, type ReactNode } from "react"

type RouteColorMap = Record<string, string>

const MenuColorsContext = createContext<RouteColorMap>({})

export function MenuColorsProvider({
  colorMap,
  children,
}: {
  colorMap: RouteColorMap
  children: ReactNode
}) {
  return <MenuColorsContext.Provider value={colorMap}>{children}</MenuColorsContext.Provider>
}

export function useMenuColor(pathname: string): string | undefined {
  const colorMap = useContext(MenuColorsContext)

  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname

  // Direct match
  if (colorMap[normalizedPath]) {
    return colorMap[normalizedPath]
  }

  // Prefix match (most specific first)
  const sortedKeys = Object.keys(colorMap).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (normalizedPath.startsWith(key)) {
      return colorMap[key]
    }
  }

  return undefined
}
