"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { submitQuoteAction } from "@/app/simulateur/actions/submit-quote"
import { Button } from "@/components/ui/button"

interface FormErrors {
  contactName?: string
  contactEmail?: string
  server?: string
}

export function QuoteForm() {
  const profile = useSimulateurStore((s) => s.profile)
  const setProfile = useSimulateurStore((s) => s.setProfile)

  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!profile.contactName.trim()) {
      newErrors.contactName = "Le nom est requis"
    }

    if (!profile.contactEmail.trim()) {
      newErrors.contactEmail = "L\u2019email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contactEmail)) {
      newErrors.contactEmail = "Format d\u2019email invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [profile.contactName, profile.contactEmail])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate()) return

      setSubmitting(true)
      setErrors((prev) => ({ ...prev, server: undefined }))

      const {
        profile: p,
        days,
        accommodations,
        selectedServices,
        currentStep,
      } = useSimulateurStore.getState()
      const result = await submitQuoteAction(
        { profile: p, days, accommodations, selectedServices, currentStep },
        message
      )

      setSubmitting(false)

      if (result.success) {
        setSubmitted(true)
      } else {
        setErrors((prev) => ({
          ...prev,
          server: result.error || "Une erreur est survenue",
        }))
      }
    },
    [validate, message]
  )

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-brand-teal/30 bg-brand-teal/5 p-8 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-brand-teal/20 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-brand-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-brand-dark">Demande envoy\u00e9e</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Merci {profile.contactName} ! Notre \u00e9quipe reviendra vers vous dans les 48 heures
          avec un devis personnalis\u00e9 \u00e0 l\u2019adresse {profile.contactEmail}.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
          Modifier ma demande
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-4"
    >
      <h2 className="font-heading uppercase font-extrabold text-2xl text-[#2A4A51]">
        Demander un devis
      </h2>
      <p className="text-muted-foreground">
        Compl\u00e9tez vos coordonn\u00e9es et notre \u00e9quipe vous contactera avec un devis
        d\u00e9taill\u00e9.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border shadow-sm p-6 md:p-8 space-y-4 max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <div className="space-y-1">
            <label htmlFor="quote-name" className="text-sm font-medium text-foreground">
              Nom <span className="text-brand-coral">*</span>
            </label>
            <input
              id="quote-name"
              type="text"
              value={profile.contactName}
              onChange={(e) => {
                setProfile({ contactName: e.target.value })
                if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: undefined }))
              }}
              placeholder="Votre nom"
              className={`w-full px-4 py-2.5 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors ${
                errors.contactName ? "border-red-400" : "border-border"
              }`}
            />
            <AnimatePresence>
              {errors.contactName && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-500"
                >
                  {errors.contactName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="quote-email" className="text-sm font-medium text-foreground">
              Email <span className="text-brand-coral">*</span>
            </label>
            <input
              id="quote-email"
              type="email"
              value={profile.contactEmail}
              onChange={(e) => {
                setProfile({ contactEmail: e.target.value })
                if (errors.contactEmail) setErrors((prev) => ({ ...prev, contactEmail: undefined }))
              }}
              placeholder="votre@email.com"
              className={`w-full px-4 py-2.5 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors ${
                errors.contactEmail ? "border-red-400" : "border-border"
              }`}
            />
            <AnimatePresence>
              {errors.contactEmail && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-500"
                >
                  {errors.contactEmail}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Entreprise */}
          <div className="space-y-1">
            <label htmlFor="quote-company" className="text-sm font-medium text-foreground">
              Entreprise
            </label>
            <input
              id="quote-company"
              type="text"
              value={profile.contactCompany}
              onChange={(e) => setProfile({ contactCompany: e.target.value })}
              placeholder="Votre entreprise"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors"
            />
          </div>

          {/* T\u00e9l\u00e9phone */}
          <div className="space-y-1">
            <label htmlFor="quote-phone" className="text-sm font-medium text-foreground">
              T\u00e9l\u00e9phone
            </label>
            <input
              id="quote-phone"
              type="tel"
              value={profile.contactPhone}
              onChange={(e) => setProfile({ contactPhone: e.target.value })}
              placeholder="+33 6 00 00 00 00"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label htmlFor="quote-message" className="text-sm font-medium text-foreground">
            Message ou demandes particuli\u00e8res
          </label>
          <textarea
            id="quote-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pr\u00e9cisez vos besoins, contraintes ou questions..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-[#2A4A51] transition-colors resize-none"
          />
        </div>

        <AnimatePresence>
          {errors.server && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
            >
              {errors.server}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#E75754] hover:bg-[#E75754]/90 text-white font-heading uppercase font-bold tracking-wider px-8"
        >
          {submitting ? "Envoi en cours..." : "Demander un devis"}
        </Button>
      </form>
    </motion.div>
  )
}
