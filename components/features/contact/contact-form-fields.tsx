"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ContactFormData } from "./contact-schema"

interface ContactFormFieldsProps {
  form: UseFormReturn<ContactFormData>
}

export function ContactFormFields({ form }: ContactFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">
            Nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nom"
            placeholder="Dupont"
            aria-required="true"
            aria-invalid={!!errors.nom}
            aria-describedby={errors.nom ? "nom-error" : undefined}
            {...register("nom")}
          />
          {errors.nom && (
            <p id="nom-error" role="alert" className="text-sm text-destructive">
              {errors.nom.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prenom">
            Prénom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="prenom"
            placeholder="Marie"
            aria-required="true"
            aria-invalid={!!errors.prenom}
            aria-describedby={errors.prenom ? "prenom-error" : undefined}
            {...register("prenom")}
          />
          {errors.prenom && (
            <p id="prenom-error" role="alert" className="text-sm text-destructive">
              {errors.prenom.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="marie.dupont@exemple.fr"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            aria-invalid={!!errors.telephone}
            aria-describedby={errors.telephone ? "telephone-error" : undefined}
            {...register("telephone")}
          />
          {errors.telephone && (
            <p id="telephone-error" role="alert" className="text-sm text-destructive">
              {errors.telephone.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organisation">Organisation</Label>
        <Input
          id="organisation"
          placeholder="Nom de votre entreprise ou association"
          {...register("organisation")}
        />
      </div>
    </div>
  )
}
