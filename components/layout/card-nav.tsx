"use client"

import type React from "react"
import { useLayoutEffect, useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import "./card-nav.css"

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

type TopBarLink = {
  label: string
  href: string
  bgColor: string
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
  topBarLinks?: TopBarLink[]
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
  topBarLinks = [],
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasBeenHovered, setHasBeenHovered] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [shouldLoadImages, setShouldLoadImages] = useState(false)
  const [collapsedCards, setCollapsedCards] = useState<Set<number>>(new Set())
  const navRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const pathname = usePathname()

  const isClosingRef = useRef(false)

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

      const topBar = 48
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
    if (!navEl) {
      console.warn("createTimeline: navRef.current is null")
      return null
    }

    const validCards = cardsRef.current.filter((card) => card !== null)
    if (validCards.length === 0) {
      console.warn("createTimeline: no valid cards found")
      return null
    }

    console.log(`createTimeline: Found ${validCards.length} cards`)

    gsap.set(navEl, { height: 48, overflow: "hidden" })
    gsap.set(validCards, { y: 50, opacity: 0 })

    const tl = gsap.timeline({ paused: true })

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    })

    tl.to(validCards, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1")

    return tl
  }

  const closeMenu = () => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    setIsHamburgerOpen(false)
    // Keep isExpanded true so .open class stays → visibility: visible during animation

    const navEl = navRef.current
    if (!navEl) {
      setIsExpanded(false)
      isClosingRef.current = false
      return
    }

    if (tlRef.current) {
      tlRef.current.pause()
    }

    // Safety timeout to reset closing ref in case animation fails
    const safetyTimeout = setTimeout(() => {
      if (isClosingRef.current) {
        console.warn("Force resetting isClosingRef after timeout")
        isClosingRef.current = false
        setIsExpanded(false)
      }
    }, 1000)

    const closeTl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimeout)
        setIsExpanded(false)
        isClosingRef.current = false
        gsap.set(navEl, { overflow: "hidden" })
        if (tlRef.current) {
          tlRef.current.kill()
          const newTl = createTimeline()
          tlRef.current = newTl
        }
      },
    })

    closeTl.to(cardsRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.12,
      stagger: 0.008,
      ease: "power2.in",
      overwrite: true,
    })

    closeTl.to(
      navEl,
      {
        height: 48,
        duration: 0.2,
        ease: "power3.inOut",
        overwrite: true,
      },
      "<0.05"
    )
  }

  useEffect(() => {
    if (isExpanded || isHamburgerOpen) {
      closeMenu() // eslint-disable-line react-hooks/set-state-in-effect -- close menu on route change
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps -- intentionally only react to pathname

  useLayoutEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const tl = createTimeline()
      if (!tl) {
        console.error("Failed to create timeline - navRef might not be ready")
      } else {
        console.log("Timeline created successfully")
      }
      tlRef.current = tl
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      tlRef.current?.kill()
      tlRef.current = null
    }
  }, [ease, items])

  // Ensure timeline is created after mount if it failed initially
  useEffect(() => {
    const checkAndRetry = () => {
      if (!tlRef.current && navRef.current) {
        console.log("Retrying timeline creation after mount")
        const tl = createTimeline()
        if (tl) {
          console.log("Timeline retry successful")
          tlRef.current = tl
        } else {
          console.error("Timeline retry failed")
        }
      }
    }

    // Try immediately
    checkAndRetry()

    // And try again after a delay if still failed
    const timeoutId = setTimeout(checkAndRetry, 100)

    return () => clearTimeout(timeoutId)
  }, [ease, items])

  useLayoutEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
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
      }, 150)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", handleResize)
    }
  }, [isExpanded])

  const [isNavHidden, setIsNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const scrolled = currentY > 50
      setIsScrolled((prev) => (prev === scrolled ? prev : scrolled))

      if (!isExpanded) {
        if (currentY > lastScrollY.current && currentY > 100) {
          setIsNavHidden(true)
        } else {
          setIsNavHidden(false)
        }
      }
      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isExpanded])

  const toggleMenu = () => {
    console.log(
      "toggleMenu called, isExpanded:",
      isExpanded,
      "tlRef.current:",
      !!tlRef.current,
      "isClosingRef:",
      isClosingRef.current
    )

    const tl = tlRef.current
    if (!tl) {
      console.error("Timeline not initialized - trying to recreate")
      const newTl = createTimeline()
      if (newTl) {
        tlRef.current = newTl
        console.log("Timeline recreated successfully")
      } else {
        console.error("Failed to recreate timeline")
        return
      }
    }

    if (isClosingRef.current) {
      console.warn("Menu is closing, please wait")
      return
    }

    if (!isExpanded) {
      console.log("Opening menu")
      // Reset closing ref just in case
      isClosingRef.current = false
      setShouldLoadImages(true)
      setIsHamburgerOpen(true)
      setIsExpanded(true)
      const isMobile = window.matchMedia("(max-width: 768px)").matches
      if (isMobile) {
        setCollapsedCards(new Set(items.map((_, idx) => idx)))
      }
      tlRef.current?.play(0)
    } else {
      console.log("Closing menu")
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
      className={`card-nav-container ${className} ${hasBeenHovered ? "expanded" : ""} ${isScrolled ? "scrolled" : ""} ${isNavHidden ? "nav-hidden" : ""}`}
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""}`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top">
          <div className="flex items-center">
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
            <span className="hamburger-label">{isExpanded ? "Fermer" : "Menu"}</span>
          </div>
          <div className="flex items-center gap-1">
            {topBarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="topbar-action-link"
                style={{ backgroundColor: link.bgColor }}
              >
                {link.label}
              </Link>
            ))}
          </div>
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
                        onClick={() => {
                          const isMobile = window.matchMedia("(max-width: 768px)").matches
                          if (!isMobile) return
                          toggleCard(idx)
                        }}
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
