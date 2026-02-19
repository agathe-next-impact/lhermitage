"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type {
  SimulateurState,
  SimulateurStep,
  SimulateurProfile,
  DayProgram,
  TimeSlot,
  AccommodationSelection,
  ServiceSelection,
} from "./types"
import {
  DEFAULT_GROUP_SIZE,
  DEFAULT_DURATION,
  DEFAULT_BUDGET_MAX,
  CRENEAU_SLOT_DEFAULTS,
  CRENEAU_LABELS,
  CRENEAU_ORDER,
} from "./constants"

function generateSlotId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function createDayFromCreneaux(dayNumber: number, creneaux: string[]): DayProgram {
  return {
    dayNumber,
    slots: creneaux.map((creneau) => {
      const defaults = CRENEAU_SLOT_DEFAULTS[creneau]
      return {
        id: generateSlotId(),
        heure_debut: defaults?.heure_debut ?? "09:00",
        type_creneau: defaults?.type_creneau ?? "activite",
        label_personnalise: CRENEAU_LABELS[creneau] ?? creneau,
      }
    }),
  }
}

const initialProfile: SimulateurProfile = {
  category: null,
  templateSlug: null,
  groupSize: DEFAULT_GROUP_SIZE,
  duration: DEFAULT_DURATION,
  budgetMax: DEFAULT_BUDGET_MAX,
  startDate: null,
  contactName: "",
  contactEmail: "",
  contactCompany: "",
  contactPhone: "",
}

const initialState: SimulateurState = {
  profile: initialProfile,
  days: [],
  accommodations: [],
  selectedServices: [],
  currentStep: "profil",
}

interface SimulateurActions {
  // Profil
  setProfile: (partial: Partial<SimulateurProfile>) => void
  // Planning
  initDays: (count: number, creneaux?: string[]) => void
  updateSlot: (dayIndex: number, slotIndex: number, data: Partial<TimeSlot>) => void
  toggleSlotItem: (
    dayIndex: number,
    slotIndex: number,
    kind: "activite" | "espace" | "service",
    slug: string
  ) => void
  clearSlot: (dayIndex: number, slotIndex: number) => void
  // Hébergements
  setAccommodation: (hebergement_slug: string, quantity: number) => void
  removeAccommodation: (hebergement_slug: string) => void
  // Services
  toggleService: (service_slug: string) => void
  setServiceOption: (service_slug: string, option_index: number) => void
  // Navigation
  setStep: (step: SimulateurStep) => void
  // Reset
  reset: () => void
}

export type SimulateurStore = SimulateurState & SimulateurActions

export const useSimulateurStore = create<SimulateurStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // ─── Profil ──────────────────────────────────────────────
    setProfile: (partial) => set((s) => ({ profile: { ...s.profile, ...partial } })),

    // ─── Planning ────────────────────────────────────────────
    initDays: (count, creneaux) =>
      set((s) => {
        const effectiveCreneaux = creneaux ?? [...CRENEAU_ORDER]
        const days: DayProgram[] = []
        for (let i = 1; i <= count; i++) {
          // Conserver les jours existants si même nombre de créneaux
          const existing = s.days.find((d) => d.dayNumber === i)
          if (existing && existing.slots.length === effectiveCreneaux.length) {
            days.push(existing)
          } else {
            days.push(createDayFromCreneaux(i, effectiveCreneaux))
          }
        }
        return { days }
      }),

    updateSlot: (dayIndex, slotIndex, data) =>
      set((s) => {
        const days = [...s.days]
        const day = { ...days[dayIndex], slots: [...days[dayIndex].slots] }
        day.slots[slotIndex] = { ...day.slots[slotIndex], ...data }
        days[dayIndex] = day
        return { days }
      }),

    toggleSlotItem: (dayIndex, slotIndex, kind, slug) =>
      set((s) => {
        const days = [...s.days]
        const day = { ...days[dayIndex], slots: [...days[dayIndex].slots] }
        const slot = { ...day.slots[slotIndex] }
        const key =
          kind === "activite"
            ? "activite_slugs"
            : kind === "espace"
              ? "espace_slugs"
              : "service_slugs"
        const current = slot[key] ?? []
        if (current.includes(slug)) {
          slot[key] = current.filter((s) => s !== slug)
          if (slot[key]!.length === 0) delete slot[key]
        } else {
          slot[key] = [...current, slug]
        }
        day.slots[slotIndex] = slot
        days[dayIndex] = day
        return { days }
      }),

    clearSlot: (dayIndex, slotIndex) =>
      set((s) => {
        const days = [...s.days]
        const day = { ...days[dayIndex], slots: [...days[dayIndex].slots] }
        const slot = { ...day.slots[slotIndex] }
        delete slot.activite_slugs
        delete slot.espace_slugs
        delete slot.service_slugs
        day.slots[slotIndex] = slot
        days[dayIndex] = day
        return { days }
      }),

    // ─── Hébergements ────────────────────────────────────────
    setAccommodation: (hebergement_slug, quantity) =>
      set((s) => {
        const accommodations = s.accommodations.filter(
          (a) => a.hebergement_slug !== hebergement_slug
        )
        if (quantity > 0) {
          accommodations.push({ hebergement_slug, quantity })
        }
        return { accommodations }
      }),

    removeAccommodation: (hebergement_slug) =>
      set((s) => ({
        accommodations: s.accommodations.filter((a) => a.hebergement_slug !== hebergement_slug),
      })),

    // ─── Services ────────────────────────────────────────────
    toggleService: (service_slug) =>
      set((s) => {
        const exists = s.selectedServices.find((sv) => sv.service_slug === service_slug)
        if (exists) {
          return {
            selectedServices: s.selectedServices.filter((sv) => sv.service_slug !== service_slug),
          }
        }
        return {
          selectedServices: [...s.selectedServices, { service_slug }],
        }
      }),

    setServiceOption: (service_slug, option_index) =>
      set((s) => ({
        selectedServices: s.selectedServices.map((sv) =>
          sv.service_slug === service_slug ? { ...sv, option_index } : sv
        ),
      })),

    // ─── Navigation ──────────────────────────────────────────
    setStep: (step) => set({ currentStep: step }),

    // ─── Reset ───────────────────────────────────────────────
    reset: () => set(initialState),
  }))
)
