"use client"

import { useState, useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { BRAND_COLORS } from "@/lib/theme/colors"
import {
  contactFormSchema,
  CONTACT_OBJECTS,
  CONTACT_OBJECT_LABELS,
  type ContactFormData,
  type ContactObject,
} from "@/components/features/contact/contact-schema"

const OBJET_COLORS: Record<ContactObject, string> = {
  sejour: BRAND_COLORS.teal,
  evenement: BRAND_COLORS.orange,
  partenariat: BRAND_COLORS.green,
  presse: BRAND_COLORS.rose,
  autre: BRAND_COLORS.darkBlue,
}
import { ContactFormFields } from "@/components/features/contact/contact-form-fields"
import { ContactSejourFields } from "@/components/features/contact/contact-sejour-fields"
import { ContactEvenementFields } from "@/components/features/contact/contact-evenement-fields"
import { ContactSuccess } from "@/components/features/contact/contact-success"
import { submitContactForm } from "./actions"

const defaultValues: Partial<ContactFormData> = {
  objet: "sejour",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  organisation: "",
  message: "",
}

const fieldAnimation = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: "auto", marginTop: 16 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
}

export function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: defaultValues as ContactFormData,
    mode: "onBlur",
  })

  const currentObjet = form.watch("objet")

  // Clean up fields when switching object type
  useEffect(() => {
    if (currentObjet !== "sejour") {
      form.unregister([
        "typeSejour",
        "nombreParticipants",
        "duree",
        "datesSouhaitees",
        "budgetEstime",
      ] as any)
    }
    if (currentObjet !== "evenement") {
      form.unregister(["typeEvenement", "dateSouhaitee"] as any)
      if (currentObjet !== "sejour") {
        form.unregister(["nombreParticipants"] as any)
      }
    }
    form.clearErrors()
  }, [currentObjet, form])

  function handleObjetChange(objet: ContactObject) {
    form.setValue("objet", objet)
  }

  function onSubmit(data: ContactFormData) {
    startTransition(async () => {
      const result = await submitContactForm(data)
      if (result.success) {
        setSuccessMessage(result.message)
        toast.success("Message envoyé")
      } else {
        toast.error(result.message)
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              form.setError(field as keyof ContactFormData, { message: messages[0] })
            }
          })
        }
      }
    })
  }

  function handleReset() {
    form.reset(defaultValues as ContactFormData)
    setSuccessMessage(null)
  }

  if (successMessage) {
    return <ContactSuccess message={successMessage} onReset={handleReset} />
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-6  pl-4" noValidate>
      {/* Sélecteur d'objet */}
      <div className="space-y-3">
        <div
          className="flex flex-wrap gap-2 pt-6"
          role="radiogroup"
          aria-label="Objet de votre demande"
        >
          {CONTACT_OBJECTS.map((obj) => {
            const color = OBJET_COLORS[obj]
            const isSelected = currentObjet === obj
            return (
              <button
                key={obj}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleObjetChange(obj)}
                style={{
                  backgroundColor: color,
                  borderColor: color,
                  opacity: isSelected ? 1 : 0.9,
                }}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-white transition-all border",
                  isSelected ? "shadow-md scale-105" : "hover:opacity-100"
                )}
              >
                {CONTACT_OBJECT_LABELS[obj]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Champs communs */}
      <ContactFormFields form={form} />

      {/* Champs conditionnels avec animation */}
      <AnimatePresence mode="wait">
        {currentObjet === "sejour" && (
          <motion.div key="sejour-fields" {...fieldAnimation}>
            <ContactSejourFields form={form} />
          </motion.div>
        )}
        {currentObjet === "evenement" && (
          <motion.div key="evenement-fields" {...fieldAnimation}>
            <ContactEvenementFields form={form} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder={
            currentObjet === "sejour"
              ? "Décrivez votre projet de séjour : objectifs, attentes particulières, besoins spécifiques..."
              : currentObjet === "evenement"
                ? "Décrivez votre événement : format, besoins techniques, restauration..."
                : "Votre message..."
          }
          aria-required="true"
          aria-invalid={!!form.formState.errors.message}
          aria-describedby={form.formState.errors.message ? "message-error" : undefined}
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <p id="message-error" role="alert" className="text-sm text-destructive">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      {/* Bouton de soumission */}
      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full bg-brand-coral hover:bg-brand-coral text-white"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send />
            Envoyer
          </>
        )}
      </Button>
    </form>
  )
}
