import type React from "react"

import type { Metadata } from "next"
import { Open_Sans, Inter } from 'next/font/google'
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
  description: "L'Hermitage, tiers-lieu rural dédié aux séjours collectifs, hébergements et activités en pleine nature.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lhermitage.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "L'Hermitage",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${openSans.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://wp-asso.com" />
        <link rel="dns-prefetch" href="https://wp-asso.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <footer className="border-t border-border bg-muted/50 py-12">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Tiers-Lieu Rural. Tous droits réservés.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
