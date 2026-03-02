"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ContactFormData } from "./contact-schema"

interface ContactEvenementFieldsProps {
  form: UseFormReturn<ContactFormData>
}

export function ContactEvenementFields({ form }: ContactEvenementFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-brand-orange/30 bg-brand-orange/5 p-4">
      <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wide">
        Informations sur votre événement
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="typeEvenement">
            Type d&apos;événement <span className="text-destructive">*</span>
          </Label>
          <Input
            id="typeEvenement"
            placeholder="Ex : Conférence, Séminaire, Atelier..."
            aria-required="true"
            {...register("typeEvenement" as keyof ContactFormData)}
          />
          {(errors as any).typeEvenement && (
            <p role="alert" className="text-sm text-destructive">
              {(errors as any).typeEvenement.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombreParticipants">
            Nombre de participants <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombreParticipants"
            type="number"
            min={1}
            max={500}
            placeholder="Ex : 50"
            aria-required="true"
            {...register("nombreParticipants" as keyof ContactFormData, {
              valueAsNumber: true,
            })}
          />
          {(errors as any).nombreParticipants && (
            <p role="alert" className="text-sm text-destructive">
              {(errors as any).nombreParticipants.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateSouhaitee">Date souhaitée</Label>
        <Input
          id="dateSouhaitee"
          placeholder="Ex : 15 mars 2026, flexible"
          {...register("dateSouhaitee" as keyof ContactFormData)}
        />
      </div>
    </div>
  )
}
