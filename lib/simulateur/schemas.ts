import { z } from "zod"

export const profilSchema = z.object({
  category: z.enum([
    "cohesion-team-building",
    "seminaire-strategique",
    "incentive-recompense",
    "deconnexion-bien-etre",
    "onboarding-integration",
  ]),
  groupSize: z.number().min(5).max(200),
  duration: z.number().min(1).max(5),
  budgetMax: z.number().min(0).optional(),
  contactName: z.string().min(2, "Le nom est requis"),
  contactEmail: z.string().email("Email invalide"),
  contactCompany: z.string().min(1, "L'entreprise est requise"),
  contactPhone: z.string().optional(),
})

export type ProfilFormData = z.infer<typeof profilSchema>
