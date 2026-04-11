"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface CarteCafeAnimatedProps {
  /** Couleur du trait dessiné */
  strokeColor?: string
  /** Épaisseur du trait */
  strokeWidth?: number
  /** Durée du tracé de CHAQUE path, en secondes */
  pathDuration?: number
  /** Décalage entre le départ de deux paths consécutifs, en secondes */
  stagger?: number
  /** Délai avant le début de l'animation, en secondes */
  initialDelay?: number
  /** Rejouer l'animation en boucle */
  loop?: boolean
  /** Conserver le remplissage d'origine une fois le trait dessiné */
  fillWhenDone?: boolean
  /** Classes CSS appliquées au conteneur */
  className?: string
}

/**
 * Dessine trait à trait les `<path>` du fichier `public/carte_café 2.svg`.
 *
 * Le SVG source contient une image PNG embarquée en arrière-plan plus 78 paths
 * remplis en noir. Le composant :
 *  - charge le SVG côté client (fetch)
 *  - masque l'image de fond
 *  - convertit chaque path filled en path stroked puis l'anime via
 *    stroke-dasharray / stroke-dashoffset en utilisant getTotalLength()
 *  - décale le départ de chaque path pour un effet "main qui dessine"
 */
export function CarteCafeAnimated({
  strokeColor = "#000000",
  strokeWidth = 1,
  pathDuration = 0.6,
  stagger = 0.08,
  initialDelay = 0,
  loop = false,
  fillWhenDone = false,
  className,
}: CarteCafeAnimatedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)

  // 1. Récupération du SVG (une seule fois)
  useEffect(() => {
    let cancelled = false
    fetch(encodeURI("/carte_café 2.svg"))
      .then((res) => {
        if (!res.ok) throw new Error(`SVG fetch failed: ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) setSvgMarkup(text)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[CarteCafeAnimated]", err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 2. Mise en place de l'animation dès que le SVG est injecté
  useEffect(() => {
    if (!svgMarkup || !containerRef.current) return

    const container = containerRef.current
    const svg = container.querySelector<SVGSVGElement>("svg")
    if (!svg) return

    // Le SVG doit remplir son conteneur de manière responsive
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet")

    // Masquer l'image PNG de fond (la carte pré-rendue)
    svg.querySelectorAll("image").forEach((img) => {
      img.setAttribute("style", "display:none")
    })

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"))

    // Le premier path du fichier (id="path78") est un rectangle plein couvrant
    // tout le canevas. On le détecte, on le masque complètement (sinon son
    // fill noir d'origine couvre le background du conteneur parent) et on
    // l'exclut de l'animation.
    const isBackgroundRect = (p: SVGPathElement) => {
      const d = p.getAttribute("d") || ""
      return /^\s*M\s*0\s*,?\s*\d+\s*V\s*0\s*H/i.test(d)
    }
    const drawablePaths: SVGPathElement[] = []
    paths.forEach((p) => {
      if (isBackgroundRect(p)) {
        p.style.display = "none"
      } else {
        drawablePaths.push(p)
      }
    })

    const originalFills = new WeakMap<SVGPathElement, string>()

    drawablePaths.forEach((path) => {
      let length: number
      try {
        length = path.getTotalLength()
      } catch {
        length = 0
      }
      if (!Number.isFinite(length) || length === 0) return

      // Sauvegarde du fill pour restauration éventuelle
      const currentFill = path.getAttribute("fill") || path.style.fill || "#000"
      originalFills.set(path, currentFill)

      path.style.fill = "none"
      path.style.stroke = strokeColor
      path.style.strokeWidth = String(strokeWidth)
      path.style.strokeLinecap = "round"
      path.style.strokeLinejoin = "round"
      path.style.strokeDasharray = `${length}`
      path.style.strokeDashoffset = `${length}`
      path.style.transition = "none"
    })

    let rafId = 0
    let timeoutIds: number[] = []

    const play = () => {
      // Reset
      drawablePaths.forEach((path) => {
        const length = Number(path.style.strokeDasharray) || 0
        path.style.transition = "none"
        path.style.strokeDashoffset = `${length}`
        path.style.fill = "none"
      })

      // Forcer un reflow pour que le reset soit pris en compte
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      svg.getBoundingClientRect()

      rafId = requestAnimationFrame(() => {
        drawablePaths.forEach((path, index) => {
          const delay = initialDelay + index * stagger
          path.style.transition = `stroke-dashoffset ${pathDuration}s ease-in-out ${delay}s${
            fillWhenDone ? `, fill 0.3s ease-out ${delay + pathDuration}s` : ""
          }`
          path.style.strokeDashoffset = "0"
          if (fillWhenDone) {
            const t = window.setTimeout(
              () => {
                path.style.fill = originalFills.get(path) || "#000"
              },
              (delay + pathDuration) * 1000
            )
            timeoutIds.push(t)
          }
        })

        if (loop) {
          const total =
            (initialDelay + drawablePaths.length * stagger + pathDuration + 0.8) * 1000
          const t = window.setTimeout(play, total)
          timeoutIds.push(t)
        }
      })
    }

    play()

    return () => {
      cancelAnimationFrame(rafId)
      timeoutIds.forEach((t) => window.clearTimeout(t))
      timeoutIds = []
    }
  }, [svgMarkup, strokeColor, strokeWidth, pathDuration, stagger, initialDelay, loop, fillWhenDone])

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full", className)}
      // Injection du markup SVG une seule fois — les mutations de style
      // suivantes sont faites via refs, React ne rerender pas ce contenu.
      dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
      aria-label="Carte animée du café"
      role="img"
    />
  )
}

export default CarteCafeAnimated
