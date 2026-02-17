"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { SimulateurData } from "./types"

const SimulateurDataContext = createContext<SimulateurData | null>(null)

export function SimulateurDataProvider({
  data,
  children,
}: {
  data: SimulateurData
  children: ReactNode
}) {
  return <SimulateurDataContext.Provider value={data}>{children}</SimulateurDataContext.Provider>
}

export function useSimulateurData(): SimulateurData {
  const ctx = useContext(SimulateurDataContext)
  if (!ctx) {
    throw new Error("useSimulateurData must be used within SimulateurDataProvider")
  }
  return ctx
}
