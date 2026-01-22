import type React from "react"

import type { Metadata } from "next"
import { Open_Sans, Inter } from 'next/font/google'
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
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
  title: "Tiers-Lieu Rural - Séjours et Hébergements",
  description: "Découvrez notre lieu unique et nos séjours personnalisés en milieu rural",
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${openSans.variable} ${inter.variable}`}>
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
