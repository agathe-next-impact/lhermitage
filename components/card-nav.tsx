"use client"

import type React from "react"
import { useLayoutEffect, useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import "./CardNav.css"

type CardNavLink = {
  label: string
  href: string
  ariaLabel: string
}

export type CardNavItem = {
  label: string
  bgColor: string
  textColor: string
  links?: CardNavLink[]
  fullWidth?: boolean
  image?: string
  imageAlt?: string
  ctaLabel?: string
  ctaHref?: string
  ctaTarget?: string
  cta2Label?: string
  cta2Href?: string
  cta2Target?: string
}

export interface CardNavProps {
  centerLogo?: string
  centerLogoAlt?: string
  items: CardNavItem[]
  className?: string
  ease?: string
  baseColor?: string
  menuColor?: string
  buttonBgColor?: string
  buttonTextColor?: string
  ctaLabel?: string
  ctaHref?: string
  ctaTarget?: string
}

const CardNav: React.FC<CardNavProps> = ({
  centerLogo,
  centerLogoAlt = "Logo",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#fff",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  ctaLabel = "Réserver",
  ctaHref = "/reserver",
  ctaTarget,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasBeenHovered, setHasBeenHovered] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [shouldLoadImages, setShouldLoadImages] = useState(false)
  const [collapsedCards, setCollapsedCards] = useState<Set<number>>(new Set())
  const navRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const pathname = usePathname()

  const closeMenu = () => {
    console.log("[v0] closeMenu called - isHamburgerOpen:", isHamburgerOpen, "isExpanded:", isExpanded)
    setIsHamburgerOpen(false)
    setIsExpanded(false)

    const navEl = navRef.current
    if (!navEl) return

    if (tlRef.current) {
      console.log("[v0] Pausing current timeline")
      tlRef.current.pause()
    }

    const closeTl = gsap.timeline({
      onComplete: () => {
        console.log("[v0] Close animation complete")
        gsap.set(navEl, { overflow: "hidden" })
        if (tlRef.current) {
          tlRef.current.kill()
          const newTl = createTimeline()
          tlRef.current = newTl
        }
      },
    })

    closeTl.to(cardsRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.2,
      stagger: 0.01,
      ease: "power2.in",
      overwrite: true,
    })

    closeTl.to(
      navEl,
      {
        height: 60,
        duration: 0.3,
        ease: "power3.inOut",
        overwrite: true,
      },
      "<0.1",
    )
  }

  useEffect(() => {
    if (isExpanded || isHamburgerOpen) {
      closeMenu()
    }
  }, [pathname])

  const calculateHeight = () => {
    const navEl = navRef.current
    if (!navEl) return 320

    const isMobile = window.matchMedia("(max-width: 768px)").matches
    const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement

    if (contentEl) {
      const wasVisible = contentEl.style.visibility
      const wasPointerEvents = contentEl.style.pointerEvents
      const wasPosition = contentEl.style.position
      const wasHeight = contentEl.style.height

      contentEl.style.visibility = "visible"
      contentEl.style.pointerEvents = "auto"
      contentEl.style.position = "static"
      contentEl.style.height = "auto"

      contentEl.offsetHeight

      const topBar = 60
      const padding = isMobile ? 96 : 24
      const contentHeight = contentEl.scrollHeight

      contentEl.style.visibility = wasVisible
      contentEl.style.pointerEvents = wasPointerEvents
      contentEl.style.position = wasPosition
      contentEl.style.height = wasHeight

      if (isMobile) {
        const maxViewportHeight = window.innerHeight
        return Math.min(maxViewportHeight, topBar + contentHeight + padding)
      } else {
        const maxHeight = window.innerHeight * 0.85
        const calculatedHeight = topBar + contentHeight + padding
        return Math.min(calculatedHeight, maxHeight)
      }
    }

    return isMobile ? 400 : 320
  }

  const createTimeline = () => {
    const navEl = navRef.current
    if (!navEl) return null

    gsap.set(navEl, { height: 60, overflow: "hidden" })
    gsap.set(cardsRef.current, { y: 50, opacity: 0 })

    const tl = gsap.timeline({ paused: true })

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    })

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1")

    return tl
  }

  useLayoutEffect(() => {
    const tl = createTimeline()
    tlRef.current = tl

    return () => {
      tl?.kill()
      tlRef.current = null
    }
  }, [ease, items])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return

      if (isExpanded) {
        const newHeight = calculateHeight()
        gsap.set(navRef.current, { height: newHeight })

        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          newTl.progress(1)
          tlRef.current = newTl
        }
      } else {
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          tlRef.current = newTl
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isExpanded])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasBeenHovered(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const toggleMenu = () => {
    console.log("[v0] toggleMenu called - isExpanded:", isExpanded, "isHamburgerOpen:", isHamburgerOpen)
    const tl = tlRef.current
    if (!tl) {
      console.log("[v0] No timeline found!")
      return
    }

    if (!isExpanded) {
      console.log("[v0] Opening menu")
      setShouldLoadImages(true)
      setIsHamburgerOpen(true)
      setIsExpanded(true)
      const isMobile = window.matchMedia("(max-width: 768px)").matches
      if (isMobile) {
        setCollapsedCards(new Set(items.map((_, idx) => idx)))
      }
      console.log("[v0] Playing timeline from 0")
      tl.play(0)
    } else {
      console.log("[v0] Closing menu")
      closeMenu()
    }
  }

  const toggleCard = (index: number) => {
    setCollapsedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })

    setTimeout(() => {
      const navEl = navRef.current
      if (navEl && isExpanded) {
        const newHeight = calculateHeight()
        gsap.to(navEl, {
          height: newHeight,
          duration: 0.3,
          ease: "power2.inOut",
        })
      }
    }, 50)
  }

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el
  }

  return (
    <div
      className={`card-nav-container ${className} ${hasBeenHovered ? "expanded" : ""} ${isScrolled ? "scrolled" : ""}`}
    >
      <nav ref={navRef} className={`card-nav ${isExpanded ? "open" : ""}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ color: menuColor || "#000" }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          {centerLogo && (
            <Link href="/" className="card-nav-center-logo" aria-label="Retour à l'accueil">
              <Image
                src={centerLogo || "/placeholder.svg"}
                alt={centerLogoAlt}
                width={120}
                height={40}
                className="center-logo-image"
                priority
              />
            </Link>
          )}

          <Link
            href={ctaHref}
            target={ctaTarget}
            className="card-nav-cta-button rounded-full"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || [])
            .filter((item) => (item.links?.length || 0) > 0 || item.image)
            .map((item, idx) => {
              const linkCount = item.links?.length || 0
              let sizeClass = ""
              if (linkCount >= 5) {
                sizeClass = "has-many-children"
              } else if (linkCount >= 3) {
                sizeClass = "has-medium-children"
              } else if (linkCount >= 1) {
                sizeClass = "has-few-children"
              } else {
                sizeClass = "has-no-children"
              }

              const isCollapsed = collapsedCards.has(idx)

              return (
                <div
                  key={`${item.label}-${idx}`}
                  className={`nav-card ${item.fullWidth ? "full-width" : ""} ${item.image ? "image-card" : ""} ${sizeClass} ${isCollapsed ? "collapsed" : ""}`}
                  ref={setCardRef(idx)}
                  style={{ backgroundColor: item.bgColor, color: item.textColor }}
                >
                  {item.image ? (
                    <>
                      <div className="nav-card-image-content-no-bg">
                        <div className="nav-card-label">{item.label}</div>
                        <div className="nav-card-image-ctas">
                          {item.ctaHref && (
                            <Link
                              href={item.ctaHref}
                              target={item.ctaTarget}
                              className="nav-card-image-cta cta-primary"
                              prefetch
                            >
                              <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                              {item.ctaLabel || "En savoir plus"}
                            </Link>
                          )}
                          {item.cta2Href && (
                            <Link
                              href={item.cta2Href}
                              target={item.cta2Target}
                              className="nav-card-image-cta cta-secondary"
                              prefetch
                            >
                              <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                              {item.cta2Label || "En savoir plus"}
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="nav-card-header"
                        onClick={() => toggleCard(idx)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={!isCollapsed}
                      >
                        <div className="nav-card-label">{item.label}</div>
                        <ChevronDown
                          className={`nav-card-chevron ${isCollapsed ? "" : "expanded"}`}
                          aria-hidden="true"
                        />
                      </div>
                      {!isCollapsed && (
                        <div className="nav-card-links">
                          {item.links?.map((lnk, i) => (
                            <Link
                              key={`${lnk.label}-${i}`}
                              className="nav-card-link"
                              href={lnk.href}
                              aria-label={lnk.ariaLabel}
                            >
                              <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                              {lnk.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}

          <div className="megamenu-logo">
            {shouldLoadImages && (
              <Image
                src="/logo-arcs-light.png"
                alt="L'Hermitage"
                width={300}
                height={300}
                className="megamenu-logo-image"
                loading="lazy"
                quality={80}
              />
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default CardNav
