import { z } from "zod"

export const CONTACT_OBJECTS = ["sejour", "evenement", "partenariat", "presse", "autre"] as const

export type ContactObject = (typeof CONTACT_OBJECTS)[number]

export const CONTACT_OBJECT_LABELS: Record<ContactObject, string> = {
  sejour: "Demande de séjour",
  evenement: "Événement / Location",
  partenariat: "Partenariat",
  presse: "Presse / Média",
  autre: "Autre",
}

export const SEJOUR_TYPES = [
  "team-building",
  "seminaire-strategique",
  "incentive",
  "bien-etre",
  "immersion-nature",
  "sur-mesure",
] as const

export const SEJOUR_TYPE_LABELS: Record<(typeof SEJOUR_TYPES)[number], string> = {
  "team-building": "Team Building",
  "seminaire-strategique": "Séminaire stratégique",
  incentive: "Incentive",
  "bien-etre": "Bien-être / Ressourcement",
  "immersion-nature": "Immersion nature",
  "sur-mesure": "Sur mesure",
}

const commonFields = {
  nom: z.string().min(2, "Le nom est requis (2 caractères minimum)"),
  prenom: z.string().min(2, "Le prénom est requis (2 caractères minimum)"),
  email: z.string().email("Adresse email invalide"),
  telephone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d\s+().-]{8,20}$/.test(val), "Numéro de téléphone invalide"),
  organisation: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
}

const sejourSchema = z.object({
  objet: z.literal("sejour"),
  ...commonFields,
  typeSejour: z.enum(SEJOUR_TYPES, {
    errorMap: () => ({ message: "Veuillez sélectionner un type de séjour" }),
  }),
  nombreParticipants: z
    .number({ invalid_type_error: "Nombre invalide" })
    .int()
    .min(1, "Minimum 1 participant")
    .max(500, "Maximum 500 participants"),
  duree: z.string().min(1, "Veuillez sélectionner une durée"),
  datesSouhaitees: z.string().optional(),
  budgetEstime: z.string().optional(),
})

const evenementSchema = z.object({
  objet: z.literal("evenement"),
  ...commonFields,
  typeEvenement: z.string().min(2, "Veuillez préciser le type d'événement"),
  nombreParticipants: z
    .number({ invalid_type_error: "Nombre invalide" })
    .int()
    .min(1, "Minimum 1 participant")
    .max(500, "Maximum 500 participants"),
  dateSouhaitee: z.string().optional(),
})

const genericSchema = z.object({
  objet: z.enum(["partenariat", "presse", "autre"] as const),
  ...commonFields,
})

export const contactFormSchema = z.discriminatedUnion("objet", [
  sejourSchema,
  evenementSchema,
  genericSchema,
])

export type ContactFormData = z.infer<typeof contactFormSchema>
