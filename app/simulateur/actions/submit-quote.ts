"use server"

import { z } from "zod"
import { calculateBudget } from "@/lib/simulateur/pricing"
import { simulateurApi } from "@/lib/simulateur/api"
import type { SimulateurState, SubmitQuoteResult } from "@/lib/simulateur/types"

const stateSchema = z.object({
  profile: z.object({
    category: z.string().nullable(),
    templateSlug: z.string().nullable(),
    groupSize: z.number().min(5).max(200),
    duration: z.number().min(1).max(5),
    budgetMax: z.number(),
    startDate: z.string().nullable(),
    contactName: z.string().min(1),
    contactEmail: z.string().email(),
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
          activite_slugs: z.array(z.string()).optional(),
          espace_slugs: z.array(z.string()).optional(),
          service_slugs: z.array(z.string()).optional(),
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

export async function submitQuoteAction(
  stateRaw: unknown,
  message: string
): Promise<SubmitQuoteResult> {
  const parsed = stateSchema.safeParse(stateRaw)
  if (!parsed.success) {
    return { success: false, error: "Données invalides" }
  }

  const state = parsed.data as SimulateurState

  // Calculate budget server-side
  const data = await simulateurApi.getAllData()
  const budget = calculateBudget(state, data, data.settings)

  // Build payload for WP REST API
  const payload = {
    contact_name: state.profile.contactName,
    contact_email: state.profile.contactEmail,
    contact_company: state.profile.contactCompany,
    contact_phone: state.profile.contactPhone,
    message,
    category: state.profile.category || "",
    group_size: state.profile.groupSize,
    duration: state.profile.duration,
    budget,
    selections: {
      days: state.days,
      accommodations: state.accommodations,
      services: state.selectedServices,
    },
  }

  // Derive WP REST base from WP_API_URL (e.g. https://admin.hermitagelelab.com/wp-json/wp/v2)
  const wpApiUrl = process.env.WP_API_URL || ""
  const wpBaseUrl = wpApiUrl.replace(/\/wp\/v2\/?$/, "")
  const endpoint = `${wpBaseUrl}/hermitage-sim/v1/devis`

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Erreur serveur" }
    }

    return { success: true, devisId: json.devis_id }
  } catch {
    return { success: false, error: "Impossible de contacter le serveur" }
  }
}
