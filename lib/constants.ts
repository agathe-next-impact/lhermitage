/** Durées de revalidation ISR centralisées (en secondes) */
export const REVALIDATION = {
  /** Homepage - contenu stable, 2h */
  homepage: 7200,
  /** Pages de listing (hébergements, séjours, activités) - 1h */
  listing: 3600,
  /** Pages de détail ([slug]) - 1h */
  detail: 3600,
  /** Contenu fréquemment mis à jour (structures, événements) - 15min */
  frequent: 900,
  /** Simulateur - données catalogue (activités, hébergements, etc.) - 1h */
  simulateur: 3600,
} as const
