export interface WPImage {
  id: number
  url: string
  alt: string
  width: number
  height: number
  sizes?: {
    thumbnail?: string
    medium?: string
    large?: string
  }
}

export interface LightweightImage {
  url: string
  alt: string
}

export interface WPLink {
  url: string
  title: string
  target?: string
}

export interface WPGoogleMap {
  lat: number
  lng: number
  address?: string
  zoom?: number
}

export interface MapPinPoint {
  visibilite: boolean
  nom?: string
  images?: WPImage[]
  descriptif?: string
  lien?: string | WPLink
  position?: {
    latitude: number
    longitude: number
    altitude: number
  }
}

export interface OptimizedMapPinPoint {
  visibilite: boolean
  nom?: string
  images?: LightweightImage[]
  descriptif?: string
  lien?: string | WPLink
  position?: {
    latitude: string
    longitude: string
    altitude?: string
  }
}

export interface PageACF {
  hero?: {
    "sous-titre"?: string
    image?: WPImage
  }
}

export interface ActiviteACF {
  nom?: string
  descriptif?: string
}

export interface EvenementACF {
  nom: string
  descriptif?: string
  date_de_debut?: string
  date_de_fin?: string
  heure_de_debut?: string
  heure_de_fin?: string
  localisation?: WPPost<StructureACF>
}

export interface HebergementACF {
  nom?: string
  descriptif?: string
  photos?: WPImage[]
  video?: string
  visibilite?: boolean
  images?: WPImage[]
  lien?: string | WPLink
  position?: {
    latitude: number
    longitude: number
    altitude: number
  }
  localisation?: WPGoogleMap
}

export interface PartenaireACF {
  nom: string
  logo?: WPImage
  lien?: WPLink
  descriptif?: string
}

export interface SejourACF {
  nom: string
  descriptif?: string
  hebergements?: {
    titre?: string
    hebergements?: string[] // Array of page URLs
  }
  activites?: {
    titre?: string
    activite?: string[] // Array of page URLs
  }
}

export interface StructureACF {
  nom?: string
  descriptif?: string
  photos?: WPImage[]
  lien?: WPLink
  video?: string
  visibilite?: boolean
  images?: WPImage[]
  position?: {
    latitude: number
    longitude: number
    altitude: number
  }
  localisation?: WPGoogleMap
}

export interface EspaceDeTravailACF {
  nom?: string
  descriptif?: string
  photos?: WPImage[]
  lien?: WPLink
  video?: string
  visibilite?: boolean
  images?: WPImage[]
  position?: {
    latitude: number
    longitude: number
    altitude: number
  }
  localisation?: WPGoogleMap
}

export interface HistoireACF {
  timeline?: Array<{
    titre?: string
    annee?: string
    descriptif?: string
    image?: WPImage
  }>
}

export interface WPPost<T = any> {
  id: number
  date: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  featured_media?: number
  categories?: number[]
  "type-de-partenaire"?: number[]
  acf?: T
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      id: number
      source_url: string
      alt_text: string
      media_details: {
        width: number
        height: number
        sizes: Record<string, { source_url: string }>
      }
    }>
    "wp:term"?: Array<
      Array<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
}

export interface WPPage extends WPPost<PageACF> {
  parent: number
  menu_order: number
}

export interface GlobalOptionsACF {
  menu?: {
    lien_du_cta_de_barre_superieure?: WPLink
    miniature_du_megamenu?: {
      titre_cta_1?: string
      lien_cta_1?: WPLink
      titre_cta_2?: string
      lien_cta_2?: WPLink
      image?: WPImage
    }
  }
  lien_du_cta_de_barre_superieure?: WPLink
  miniature_du_megamenu?: {
    titre_cta_1?: string
    lien_cta_1?: WPLink
    titre_cta_2?: string
    lien_cta_2?: WPLink
    image?: WPImage
  }
}

export interface WPMenuItem {
  id: number
  title: string
  url: string
  slug?: string
  parent: number
  order: number
  children?: WPMenuItem[]
}

export interface MenuItem {
  id: number
  title: string
  slug: string
  url: string
  parent: number
  children?: MenuItem[]
}

export interface WPTerm {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
}

export interface TeamMemberACF {
  binome_seul?: boolean // true = binôme, false = seul
  descriptif?: string
  photo?: WPImage
  activite_principale?: string
}
