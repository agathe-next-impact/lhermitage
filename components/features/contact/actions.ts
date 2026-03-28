"use server"

import {
  contactFormSchema,
  CONTACT_OBJECT_LABELS,
  type ContactFormData,
} from "@/components/features/contact/contact-schema"
import { logger } from "@/lib/logger"

export type ContactFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function submitContactForm(data: ContactFormData): Promise<ContactFormState> {
  const result = contactFormSchema.safeParse(data)

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    return {
      success: false,
      message: "Veuillez corriger les erreurs ci-dessous.",
      errors: fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const label = CONTACT_OBJECT_LABELS[result.data.objet]
    logger.log(`[Contact] Nouvelle demande: ${label}`, JSON.stringify(result.data, null, 2))

    const wpEndpoint = process.env.WP_CONTACT_ENDPOINT
    if (wpEndpoint) {
      const response = await fetch(wpEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      })
      if (!response.ok) {
        logger.error("[Contact] WP endpoint error:", response.status)
      }
    }

    return {
      success: true,
      message:
        "Votre message a bien été envoyé. Nous vous recontacterons dans les meilleurs délais.",
    }
  } catch (error) {
    logger.error("[Contact] Submission error:", error)
    return {
      success: false,
      message: "Une erreur est survenue. Veuillez réessayer ultérieurement.",
    }
  }
}
