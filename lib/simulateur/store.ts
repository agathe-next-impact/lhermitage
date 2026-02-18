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
  EspaceSelection,
} from "./types"
import {
  DEFAULT_GROUP_SIZE,
  DEFAULT_DURATION,
  DEFAULT_BUDGET_MAX,
  DEFAULT_DAY_SLOTS,
} from "./constants"

function generateSlotId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function createDefaultDay(dayNumber: number): DayProgram {
  return {
    dayNumber,
    slots: DEFAULT_DAY_SLOTS.map((s) => ({
      id: generateSlotId(),
      heure_debut: s.heure_debut,
      type_creneau: s.type_creneau,
      label_personnalise: s.label,
    })),
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
  selectedEspaces: [],
  currentStep: "profil",
}

interface SimulateurActions {
  // Profil
  setProfile: (partial: Partial<SimulateurProfile>) => void
  // Planning
  initDays: (count: number) => void
  updateSlot: (dayIndex: number, slotIndex: number, data: Partial<TimeSlot>) => void
  addSlot: (dayIndex: number, slot: Omit<TimeSlot, "id">) => void
  removeSlot: (dayIndex: number, slotIndex: number) => void
  clearSlot: (dayIndex: number, slotIndex: number) => void
  // Hébergements
  setAccommodation: (hebergement_slug: string, quantity: number) => void
  removeAccommodation: (hebergement_slug: string) => void
  // Services
  toggleService: (service_slug: string) => void
  setServiceOption: (service_slug: string, option_index: number) => void
  // Espaces de travail
  toggleEspace: (espace_slug: string) => void
  setEspacePrivatise: (espace_slug: string, privatise: boolean) => void
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
    initDays: (count) =>
      set((s) => {
        const days: DayProgram[] = []
        for (let i = 1; i <= count; i++) {
          // Conserver les jours existants si possible
          const existing = s.days.find((d) => d.dayNumber === i)
          days.push(existing ?? createDefaultDay(i))
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

    addSlot: (dayIndex, slot) =>
      set((s) => {
        const days = [...s.days]
        const day = { ...days[dayIndex], slots: [...days[dayIndex].slots] }
        day.slots.push({ ...slot, id: generateSlotId() })
        day.slots.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
        days[dayIndex] = day
        return { days }
      }),

    removeSlot: (dayIndex, slotIndex) =>
      set((s) => {
        const days = [...s.days]
        const day = { ...days[dayIndex], slots: [...days[dayIndex].slots] }
        day.slots.splice(slotIndex, 1)
        days[dayIndex] = day
        return { days }
      }),

    clearSlot: (dayIndex, slotIndex) =>
      set((s) => {
        const days = [...s.days]
        const day = { ...days[dayIndex], slots: [...days[dayIndex].slots] }
        const slot = { ...day.slots[slotIndex] }
        delete slot.activite_slug
        delete slot.espace_slug
        delete slot.service_slug
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

    // ─── Espaces de travail ────────────────────────────────────
    toggleEspace: (espace_slug) =>
      set((s) => {
        const exists = s.selectedEspaces.find((e) => e.espace_slug === espace_slug)
        if (exists) {
          return {
            selectedEspaces: s.selectedEspaces.filter((e) => e.espace_slug !== espace_slug),
          }
        }
        return {
          selectedEspaces: [...s.selectedEspaces, { espace_slug, privatise: false }],
        }
      }),

    setEspacePrivatise: (espace_slug, privatise) =>
      set((s) => ({
        selectedEspaces: s.selectedEspaces.map((e) =>
          e.espace_slug === espace_slug ? { ...e, privatise } : e
        ),
      })),

    // ─── Navigation ──────────────────────────────────────────
    setStep: (step) => set({ currentStep: step }),

    // ─── Reset ───────────────────────────────────────────────
    reset: () => set(initialState),
  }))
)
