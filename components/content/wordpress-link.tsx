import type React from "react"
import Link from "next/link"
import { transformWordPressUrl } from "@/lib/wordpress/url-transform"

interface WordPressLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
  [key: string]: any
}

/**
 * Link component that automatically transforms WordPress URLs to frontend URLs
 * Use this component instead of Next.js Link when dealing with WordPress URLs
 */
export function WordPressLink({ href, children, className, target, rel, ...props }: WordPressLinkProps) {
  const transformedHref = transformWordPressUrl(href)

  // If it's an external link (not transformed to /), use regular <a> tag
  if (!transformedHref.startsWith("/") && !href.startsWith("/")) {
    return (
      <a href={transformedHref} className={className} target={target} rel={rel} {...props}>
        {children}
      </a>
    )
  }

  // Use Next.js Link for internal links
  return (
    <Link href={transformedHref} className={className} target={target} {...props}>
      {children}
    </Link>
  )
}
