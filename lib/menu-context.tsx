"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface MenuContextType {
  isOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
  openMenu: () => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen((prev) => !prev)
  const closeMenu = () => setIsOpen(false)
  const openMenu = () => setIsOpen(true)

  return (
    <MenuContext.Provider value={{ isOpen, toggleMenu, closeMenu, openMenu }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}
