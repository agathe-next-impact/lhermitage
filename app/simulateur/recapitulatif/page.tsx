import type { Metadata } from "next"
import { RecapitulatifContent } from "./recap-content"

export const metadata: Metadata = {
  title: "Simulateur de séjour — Récapitulatif",
  description: "Récapitulatif de votre séjour corporate sur mesure à L’Hermitage.",
}

export default function RecapitulatifPage() {
  return <RecapitulatifContent />
}
