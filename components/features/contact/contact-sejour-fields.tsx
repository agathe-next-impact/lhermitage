"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SEJOUR_TYPES, SEJOUR_TYPE_LABELS, type ContactFormData } from "./contact-schema"

interface ContactSejourFieldsProps {
  form: UseFormReturn<ContactFormData>
}

export function ContactSejourFields({ form }: ContactSejourFieldsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const typeSejour = watch("typeSejour" as keyof ContactFormData)
  const duree = watch("duree" as keyof ContactFormData)

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-brand-teal/30 bg-brand-teal/5 p-4">
      <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wide">
        Informations sur votre séjour
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="typeSejour">
            Type de séjour <span className="text-destructive">*</span>
          </Label>
          <Select
            value={(typeSejour as string) || ""}
            onValueChange={(value) =>
              setValue("typeSejour" as keyof ContactFormData, value as any, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="typeSejour" aria-required="true">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {SEJOUR_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {SEJOUR_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(errors as any).typeSejour && (
            <p role="alert" className="text-sm text-destructive">
              {(errors as any).typeSejour.message}
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
            placeholder="Ex : 25"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duree">
            Durée souhaitée <span className="text-destructive">*</span>
          </Label>
          <Select
            value={(duree as string) || ""}
            onValueChange={(value) =>
              setValue("duree" as keyof ContactFormData, value as any, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="duree" aria-required="true">
              <SelectValue placeholder="Sélectionnez une durée" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 jour">1 jour</SelectItem>
              <SelectItem value="2 jours">2 jours</SelectItem>
              <SelectItem value="3 jours">3 jours</SelectItem>
              <SelectItem value="4 jours">4 jours</SelectItem>
              <SelectItem value="5 jours">5 jours</SelectItem>
              <SelectItem value="Plus de 5 jours">Plus de 5 jours</SelectItem>
            </SelectContent>
          </Select>
          {(errors as any).duree && (
            <p role="alert" className="text-sm text-destructive">
              {(errors as any).duree.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="datesSouhaitees">Dates souhaitées</Label>
          <Input
            id="datesSouhaitees"
            placeholder="Ex : juin 2026, flexible"
            {...register("datesSouhaitees" as keyof ContactFormData)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budgetEstime">Budget estimé</Label>
        <Input
          id="budgetEstime"
          placeholder="Ex : 5 000 - 10 000 €"
          {...register("budgetEstime" as keyof ContactFormData)}
        />
      </div>
    </div>
  )
}
