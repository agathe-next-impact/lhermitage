import type React from "react"

import type { Metadata } from "next"
import { Open_Sans, Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { Providers } from "@/components/providers"

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "L'Hermitage - Tiers-Lieu Rural",
    template: "%s | L'Hermitage",
  },
  description:
    "L'Hermitage, tiers-lieu rural dédié aux séjours collectifs, hébergements et activités en pleine nature.",
  metadataBase: new URL(process.env.SITE_URL || "https://lhermitage.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "L'Hermitage",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${openSans.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://admin.hermitagelelab.com" />
        <link rel="dns-prefetch" href="https://admin.hermitagelelab.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <SiteHeader />
          <main className="mb-12">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
