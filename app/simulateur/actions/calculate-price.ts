"use server"

import { z } from "zod"
import { calculateBudget } from "@/lib/simulateur/pricing"
import type { SimulateurState, BudgetBreakdown } from "@/lib/simulateur/types"
import { simulateurApi } from "@/lib/simulateur/api"

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

export async function calculatePriceAction(
  stateRaw: unknown
): Promise<{ success: true; budget: BudgetBreakdown } | { success: false; error: string }> {
  const parsed = inputSchema.safeParse(stateRaw)
  if (!parsed.success) return { success: false, error: "Donn\u00e9es invalides" }

  const data = await simulateurApi.getAllData()
  const budget = calculateBudget(parsed.data as SimulateurState, data)
  return { success: true, budget }
}
