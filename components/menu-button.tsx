"use client"

import { useMenu } from "@/lib/menu-context"
import { motion } from "framer-motion"

export function MenuButton({ isScrolled = false }: { isScrolled?: boolean }) {
  const { toggleMenu, isOpen } = useMenu()

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm font-bold uppercase transition-colors duration-300 ${isScrolled ? "text-[#E75754]" : "text-white"}`}
        style={{
          textShadow: isScrolled ? "none" : "0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
        }}
      >
        menu
      </span>
      <motion.button
        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        key={isOpen ? "open" : "closed"}
        onClick={toggleMenu}
        className="rounded-full bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] transition-all hover:scale-110 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#E75754] focus:ring-offset-2"
        aria-label="Toggle menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[#E75754]"
        >
          <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.button>
    </div>
  )
}
