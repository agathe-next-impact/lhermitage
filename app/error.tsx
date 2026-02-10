"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error.digest || error.message)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <div className="rounded-full bg-red-50 p-4">
          <svg
            className="h-8 w-8 text-[#E75754]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Nous nous excusons pour la gêne occasionnée. Veuillez réessayer ou revenir à la page d&apos;accueil.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={reset} variant="outline" className="rounded-full">
            Réessayer
          </Button>
          <Button asChild className="rounded-full bg-[#56939F] hover:bg-[#46838f]">
            <a href="/">Accueil</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
