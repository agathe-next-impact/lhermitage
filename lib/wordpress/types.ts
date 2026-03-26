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
  // Homepage fields
  slogan?: string
  video?: string
  video_auto_hebergee?: { url: string; mime_type: string }
  // Hero section
  hero?: {
    "sous-titre"?: string
    image?: WPImage
    images_laterales?: WPImage[]
  }
  timeline?: Array<{
    titre?: string
    annee?: string
    descriptif?: string
    image?: WPImage
  }>
  // Devenir sociétaire page fields
  chapeau?: string
  bandeau?: {
    titre?: string
    cta?: { url: string; title?: string; target?: string }
    galerie?: { images: Array<{ ID: number; url: string; alt: string }> }
  }
  pourquoi_rejoindre?: {
    titre?: string
    raisons?: Array<{ raison: string }>
  }
  ce_quest_devenir_societaire?: {
    titre?: string
    motivation_1?: string
    motivation_2?: string
    motivation_3?: string
    motivation_4?: string
  }
  "quest-ce_que_la_scic"?: {
    titre?: string
    caracteristiques_de_la_scic?: Array<{
      caracteristique: { titre?: string; descriptif?: string }
    }>
  }
  informations_societariat?: Array<{ titre?: string; descriptif?: string }>
  // Page Structures fields
  page_structures?: {
    structures_internes?: {
      titre_de_section?: string
      image_de_section?: WPImage
    }
    structures_hebergees?: {
      titre_de_section?: string
      image_de_section?: WPImage
    }
  }
  // Page Localisation fields
  localisation_page?: {
    adresse?: {
      ligne_1?: string
      ligne_2?: string
      description?: string
      image?: WPImage
      carte_url?: string
    }
    moyens_acces?: Array<{
      titre?: string
      icone?: string
      couleur?: string
      duree?: string
      contenu?: string
    }>
    logistique?: {
      titre?: string
      texte?: string
      services?: Array<{ label?: string; icone?: string }>
      note?: string
      image?: WPImage
    }
  }
  // Page Horaires fields
  horaires_page?: {
    image_ambiance?: WPImage
    accroche?: string
    bon_a_savoir?: string
    cafe?: {
      titre?: string
      sous_titre?: string
      horaires?: Array<{
        jour?: string
        heures?: string
        ferme?: boolean
        note?: string
        evenement?: boolean
      }>
      encarts?: Array<{
        titre?: string
        texte?: string
        icone?: string
        couleur?: string
      }>
    }
    domaine?: {
      titre?: string
      sous_titre?: string
      texte?: string
      image?: WPImage
      badges?: Array<{ label?: string; description?: string }>
      note?: string
    }
    sejours?: {
      titre?: string
      sous_titre?: string
      accroche?: string
      texte?: string
    }
  }
  // Page Contacts fields
  contacts_equipe?: Array<{
    nom: string
    role: string
    organisation?: string
    photo?: WPImage
    email?: string
    telephones?: Array<{ numero: string; label?: string }>
    adresse?: string
  }>
  // Page Patrimoine fields
  patrimoine?: PatrimoineACF
  // Page Séminaires fields
  seminaires?: SeminairesACF
  // Page Recrutement fields
  recrutement?: RecrutementACF
  [key: string]: any
}

export interface ActiviteACF {
  nom?: string
  descriptif?: string
}

export interface ServiceACF {
  nom?: string
  descriptif?: string
  photos?: WPImage[]
}

export interface EvenementACF {
  eventDateStart?: string
  eventDateEnd?: string
  eventDateLabel?: string
  eventPitch?: string
  eventVenue?: string | string[]
  eventVenueLabel?: string
  eventAddress?: string
  eventZip?: string
  eventCity?: string
  eventAccessType?: string
  eventCapacityLimited?: boolean
  eventCapacityTotal?: number
  eventBookingRequired?: boolean
  eventBookingType?: string
  eventBookingCtaLabel?: string
  eventFoodAvailable?: boolean
  eventFoodDescription?: string
  eventFoodLocal?: boolean
  eventContactPhone?: string
  eventContactEmail?: string
  eventIcon?: string
  eventColorAccent?: string
}

export interface HebergementACF {
  nom?: string
  descriptif?: string
  descriptifPinPoint?: string
  disponibilite?: string
  capacite_daccueil?: number
  repartition_des_chambres?: string
  commodites?: string
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
    hebergements?: Array<{
      hebergement: string | WPPost<HebergementACF>
    }>
  }
  activites?: {
    titre?: string
    activite?: Array<{
      activite: string | WPPost<ActiviteACF>
    }>
  }
}

export interface StructureACF {
  nom?: string
  descriptif?: string
  descriptifPinPoint?: string
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
  type_de_structure?: "interne" | "hebergee"
}

export interface EspaceDeTravailACF {
  nom?: string
  descriptif?: string
  descriptifPinPoint?: string
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

/* ─── Séminaires & Séjours Entreprises ─── */

export interface SeminairesACF {
  hero_seminaires?: {
    video?: { url: string; mime_type?: string }
    image?: WPImage
    accroche?: string
    sous_titre?: string
    cta_texte?: string
    cta_lien?: WPLink
  }
  promesse?: {
    titre?: string
    storytelling?: string
    image?: WPImage
    chiffres_cles?: Array<{
      valeur?: string
      unite?: string
      label?: string
    }>
  }
  espaces_travail?: {
    titre?: string
    introduction?: string
    espaces?: WPPost<EspaceDeTravailACF>[]
    facilitation?: {
      titre?: string
      contenu?: string
      badge?: string
    }
  }
  activites_teambuilding?: {
    titre?: string
    sous_titre?: string
    activites?: WPPost<ActiviteACF>[]
  }
  restauration?: {
    services?: WPPost<ServiceACF>[]
  }
  hebergements_seminaires?: {
    titre?: string
    sous_titre?: string
    hebergements?: WPPost<HebergementACF>[]
  }
  temoignages?: {
    titre?: string
    citations?: Array<{
      citation?: string
      auteur?: string
      role?: string
    }>
    logos?: WPImage[]
  }
  contact?: {
    titre?: string
    conciergerie?: string
    nom_contact?: string
    email?: string
    telephone?: string
    photo?: WPImage
    cta_texte?: string
    cta_lien?: WPLink
  }
}

export interface PatrimoineSection {
  annee?: string
  titre?: string
  accroche?: string
  contenu?: string
  citation?: string
  image?: WPImage
  video_url?: string
}

export interface PatrimoineACF {
  introduction?: {
    citation?: string
    texte?: string
  }
  sections?: PatrimoineSection[]
  valeurs?: Array<{ titre?: string; descriptif?: string }>
  publics?: Array<{ public?: string; proposition?: string }>
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
    "wp:term"?: Array<Array<WPTerm>>
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
  display_order?: number
  image?: { url: string; alt: string } | null
}

export interface FooterLink {
  label: string
  url: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterOptions {
  logo: {
    url: string
    alt: string
  }
  description: string
  copyright: string
  social: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    twitter?: string
  }
  columns: FooterColumn[]
  contact: {
    adresse: string
    telephone: string
    email: string
  }
}

/* ─── Pages Recrutement / Engagement ─── */

export interface RecrutementChiffreCle {
  icone?: string
  categorie?: string
  valeur: string
  description?: string
}

export interface RecrutementOffre {
  icone?: string
  titre: string
  descriptif?: string
  missions?: Array<{ texte: string }>
  profil?: Array<{ texte: string }>
  cta_texte?: string
  cta_lien?: string
}

export interface RecrutementBlocElement {
  titre?: string
  description?: string
}

export interface RecrutementBloc {
  icone?: string
  titre: string
  texte_intro?: string
  elements?: RecrutementBlocElement[]
  note?: string
  image?: WPImage
}

export interface RecrutementTemoignage {
  citation: string
  auteur: string
  role?: string
  photo?: WPImage
}

export interface RecrutementChampFormulaire {
  label: string
  type_champ: "text" | "email" | "url" | "textarea" | "select" | "file"
  requis?: boolean
  options?: string
}

export interface RecrutementACF {
  introduction?: {
    titre?: string
    texte?: string
    chiffres_cles?: RecrutementChiffreCle[]
  }
  offres?: RecrutementOffre[]
  cadre_de_vie?: {
    titre?: string
    blocs?: RecrutementBloc[]
  }
  temoignages?: RecrutementTemoignage[]
  candidature?: {
    titre?: string
    texte?: string
    email?: string
    email_secondaire?: string
    activer_formulaire?: boolean
    champs?: RecrutementChampFormulaire[]
  }
}

export interface TeamMemberACF {
  binome_seul?: boolean // true = binôme, false = seul
  descriptif?: string
  photo?: WPImage
  activite_principale?: string
}
