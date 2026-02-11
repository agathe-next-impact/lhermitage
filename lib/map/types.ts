export interface MapPinPointData {
  id: number
  type: string
  title: string
  slug: string
  link: string
  mapPinPoint: {
    visibilite: boolean
    nom?: string
    images?: Array<{ url: string; alt: string }>
    descriptif?: string
    lien?: string | { url: string; title: string }
    position?: {
      latitude: number
      longitude: number
      altitude: number
    }
  }
}

export interface TourStop {
  name: string
  description: string
  longitude: number
  latitude: number
  zoom: number
  image?: string
  link: string
  externalLink: string
  type: string
  slug: string
  pointId: number
}
