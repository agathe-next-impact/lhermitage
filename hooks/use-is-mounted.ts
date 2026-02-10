"use client"

import { useEffect, useState } from "react"

/** Hydration guard — returns true once the component has mounted on the client. */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
