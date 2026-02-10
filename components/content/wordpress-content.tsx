"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { transformContentLinks } from "@/lib/wordpress/transform-content"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

interface WordPressContentProps {
  html: string
  className?: string
}

/**
 * Component to render WordPress HTML content with transformed internal links
 * Intercepts clicks on internal links and uses Next.js router for client-side navigation
 */
export function WordPressContent({ html, className = "prose prose-stone max-w-none" }: WordPressContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Transform links in HTML
  const transformedHtml = transformContentLinks(html)

  useEffect(() => {
    if (!contentRef.current) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (!link) return

      const href = link.getAttribute("href")
      if (!href) return

      // Check if it's an internal link (starts with /)
      if (href.startsWith("/")) {
        e.preventDefault()
        router.push(href)
      }
    }

    const content = contentRef.current
    content.addEventListener("click", handleClick)

    return () => {
      content.removeEventListener("click", handleClick)
    }
  }, [router])

  return <div ref={contentRef} className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(transformedHtml) }} />
}
