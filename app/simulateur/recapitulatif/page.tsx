import type { Metadata } from "next"
import { RecapitulatifContent } from "./recap-content"

export const metadata: Metadata = {
  title: "Simulateur de s\u00e9jour \u2014 R\u00e9capitulatif",
  description:
    "R\u00e9capitulatif de votre s\u00e9jour corporate sur mesure \u00e0 L\u2019Hermitage.",
}

export default function RecapitulatifPage() {
  return <RecapitulatifContent />
}
