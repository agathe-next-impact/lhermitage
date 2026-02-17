"use server"

import { z } from "zod"

const inputSchema = z.object({
  profile: z.object({
    category: z.string().nullable(),
    templateSlug: z.string().nullable(),
    groupSize: z.number().min(5).max(200),
    duration: z.number().min(1).max(5),
    budgetMax: z.number(),
    startDate: z.string().nullable(),
    contactName: z.string(),
    contactEmail: z.string(),
    contactCompany: z.string(),
    contactPhone: z.string(),
  }),
  days: z.array(
    z.object({
      dayNumber: z.number(),
      slots: z.array(
        z.object({
          id: z.string(),
          heure_debut: z.string(),
          type_creneau: z.enum(["activite", "repas", "travail", "libre", "soiree"]),
          activite_slug: z.string().optional(),
          espace_slug: z.string().optional(),
          service_slug: z.string().optional(),
          label_personnalise: z.string().optional(),
        })
      ),
    })
  ),
  accommodations: z.array(
    z.object({
      hebergement_slug: z.string(),
      quantity: z.number(),
    })
  ),
  selectedServices: z.array(
    z.object({
      service_slug: z.string(),
      option_index: z.number().optional(),
    })
  ),
  currentStep: z.string(),
})

export async function generatePdfAction(
  stateRaw: unknown
): Promise<{ success: boolean; message: string }> {
  const parsed = inputSchema.safeParse(stateRaw)
  if (!parsed.success) {
    return { success: false, message: "Donn\u00e9es invalides. V\u00e9rifiez votre configuration." }
  }

  // PDF generation will be handled client-side with @react-pdf/renderer
  // This action validates the data server-side before the client generates the PDF
  return {
    success: true,
    message: "Donn\u00e9es valid\u00e9es. G\u00e9n\u00e9ration PDF c\u00f4t\u00e9 client.",
  }
}
