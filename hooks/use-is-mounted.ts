"use client"

import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/** Hydration guard — returns true once the component has mounted on the client. */
export function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
}
