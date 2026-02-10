import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export function truncateText(html: string, maxLength: number): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}
