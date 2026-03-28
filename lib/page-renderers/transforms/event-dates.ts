/**
 * Date parsing utilities for événements.
 * Extracted from app/ecosysteme-innovant/evenements/page.tsx.
 */

export const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

/** Lowercase French month names -> 0-based index */
const FR_MONTH_INDEX: Record<string, number> = {
  janvier: 0,
  février: 1,
  fevrier: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  août: 7,
  aout: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  décembre: 11,
  decembre: 11,
}

/** Parse an ISO date string and return { monthKey, monthLabel } */
export function extractMonth(dateStr?: string): { monthKey: string; monthLabel: string } | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    const month = d.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, "0")}`
    const label = `${MONTH_NAMES[month]} ${year}`
    return { monthKey: key, monthLabel: label }
  } catch {
    return null
  }
}

/**
 * Parse a French free-text date label like "Vendredi 20 mars a 19h"
 * and extract { monthKey, monthLabel, sortDay }.
 * Falls back to null if no month name is found.
 */
export function extractMonthFromLabel(
  label?: string
): { monthKey: string; monthLabel: string; sortDay: number } | null {
  if (!label) return null
  const lower = label.toLowerCase()
  for (const [name, idx] of Object.entries(FR_MONTH_INDEX)) {
    if (lower.includes(name)) {
      const dayMatch = lower.match(new RegExp(`(\\d{1,2})\\s+${name}`))
      const day = dayMatch ? parseInt(dayMatch[1], 10) : 1
      const now = new Date()
      let year = now.getFullYear()
      const candidateDate = new Date(year, idx, day)
      if (candidateDate.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
        year += 1
      }
      const key = `${year}-${String(idx + 1).padStart(2, "0")}`
      return { monthKey: key, monthLabel: `${MONTH_NAMES[idx]} ${year}`, sortDay: day }
    }
  }
  return null
}
