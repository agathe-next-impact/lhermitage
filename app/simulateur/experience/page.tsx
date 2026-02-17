import type { Metadata } from "next"
import { ExperiencePageClient } from "./experience-page-client"

export const metadata: Metadata = {
  title: "Simulateur — Expérience",
  description: "Composez le programme de votre séjour jour par jour.",
}

export default function ExperiencePage() {
  return <ExperiencePageClient />
}
