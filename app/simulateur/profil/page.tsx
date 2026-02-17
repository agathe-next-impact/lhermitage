import type { Metadata } from "next"
import { ProfilForm } from "@/components/features/simulateur/profil/profil-form"

export const metadata: Metadata = {
  title: "Simulateur de séjour — Profil",
  description:
    "Définissez le profil de votre séjour corporate : type, nombre de participants, durée.",
}

export default function ProfilPage() {
  return <ProfilForm />
}
