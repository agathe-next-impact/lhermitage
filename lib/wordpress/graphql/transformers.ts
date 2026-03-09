import type {
  WPPost,
  WPPage,
  WPImage,
  WPMenuItem,
  WPTerm,
  PageACF,
  HebergementACF,
  SejourACF,
  ActiviteACF,
  StructureACF,
  EvenementACF,
  PartenaireACF,
  TeamMemberACF,
  EspaceDeTravailACF,
  GlobalOptionsACF,
  WPLink,
  WPGoogleMap,
} from "../types"
import { transformWordPressUrl, rewriteWordPressAssetUrl } from "../url-transform"
import { transformContentLinks } from "../transform-content"

// --- Image transformers ---

interface GqlMediaSize {
  name: string
  sourceUrl: string
  width?: string
  height?: string
}

interface GqlMediaItem {
  databaseId: number
  sourceUrl: string
  altText?: string
  mediaDetails?: {
    width?: number
    height?: number
    sizes?: GqlMediaSize[]
  }
}

export function transformImage(gqlImage: GqlMediaItem | null | undefined): WPImage | undefined {
  if (!gqlImage) return undefined

  const sizesMap: Record<string, string> = {}
  gqlImage.mediaDetails?.sizes?.forEach((s) => {
    sizesMap[s.name] = rewriteWordPressAssetUrl(s.sourceUrl)
  })

  return {
    id: gqlImage.databaseId,
    url: rewriteWordPressAssetUrl(gqlImage.sourceUrl),
    alt: gqlImage.altText || "",
    width: gqlImage.mediaDetails?.width || 0,
    height: gqlImage.mediaDetails?.height || 0,
    sizes: {
      thumbnail: sizesMap["thumbnail"],
      medium: sizesMap["medium"],
      large: sizesMap["large"],
    },
  }
}

export function transformImages(gqlImages: GqlMediaItem[] | null | undefined): WPImage[] {
  if (!gqlImages) return []
  return gqlImages.map(transformImage).filter((img): img is WPImage => img !== undefined)
}

// Transform AcfMediaItemConnection { nodes: MediaItem[] } → WPImage[]
function transformAcfMediaConnection(
  conn: { nodes?: GqlMediaItem[] } | GqlMediaItem[] | null | undefined
): WPImage[] {
  if (!conn) return []
  // Handle both { nodes: [...] } and raw array formats
  const items = Array.isArray(conn) ? conn : conn.nodes
  if (!items) return []
  return transformImages(items)
}

// Transform AcfMediaItemConnectionEdge { node: MediaItem } → WPImage | undefined
function transformAcfMediaEdge(
  edge: { node?: GqlMediaItem } | GqlMediaItem | null | undefined
): WPImage | undefined {
  if (!edge) return undefined
  // Handle both { node: {...} } and raw MediaItem formats
  const item = (edge as any).node || edge
  if (!item?.sourceUrl) return undefined
  return transformImage(item as GqlMediaItem)
}

// --- Link transformer ---

function transformLink(gqlLink: any): WPLink | undefined {
  if (!gqlLink) return undefined
  return {
    url: transformWordPressUrl(gqlLink.url || ""),
    title: gqlLink.title || gqlLink.titre || "",
    target: gqlLink.target || "",
  }
}

// --- Google Map transformer ---
// AcfGoogleMap has: latitude, longitude, zoom, streetAddress, city, country, etc.

function transformGoogleMap(gqlMap: any): WPGoogleMap | undefined {
  if (!gqlMap) return undefined
  return {
    lat: parseFloat(gqlMap.lat || gqlMap.latitude || 0),
    lng: parseFloat(gqlMap.lng || gqlMap.longitude || 0),
    address: gqlMap.address || gqlMap.streetAddress || gqlMap.adresse,
    zoom: gqlMap.zoom ? parseInt(gqlMap.zoom) : undefined,
  }
}

// --- Embedded media transformer ---

function transformFeaturedMedia(gqlFeaturedImage: { node: GqlMediaItem } | null | undefined) {
  if (!gqlFeaturedImage?.node) return undefined
  const media = gqlFeaturedImage.node
  const sizesMap: Record<string, { source_url: string }> = {}
  media.mediaDetails?.sizes?.forEach((s) => {
    sizesMap[s.name] = { source_url: rewriteWordPressAssetUrl(s.sourceUrl) }
  })

  return {
    "wp:featuredmedia": [
      {
        id: media.databaseId,
        source_url: rewriteWordPressAssetUrl(media.sourceUrl),
        alt_text: media.altText || "",
        media_details: {
          width: media.mediaDetails?.width || 0,
          height: media.mediaDetails?.height || 0,
          sizes: sizesMap,
        },
      },
    ],
  }
}

// --- Post transformers ---

interface GqlPostBase {
  databaseId: number
  slug: string
  title?: string
  content?: string | null
  excerpt?: string | null
  date?: string
  status?: string
  link?: string
  featuredImage?: { node: GqlMediaItem } | null
  contentTypeName?: string
}

export function transformPost<T = any>(
  gqlPost: GqlPostBase & Record<string, any>,
  acf?: T,
  type?: string
): WPPost<T> {
  return {
    id: gqlPost.databaseId,
    date: gqlPost.date || "",
    slug: gqlPost.slug,
    status: gqlPost.status || "publish",
    type: type || gqlPost.contentTypeName || "post",
    link: transformWordPressUrl(gqlPost.link || ""),
    title: { rendered: gqlPost.title || "" },
    content: { rendered: transformContentLinks(gqlPost.content || "") },
    excerpt: { rendered: transformContentLinks(gqlPost.excerpt || "") },
    acf: acf,
    _embedded: transformFeaturedMedia(gqlPost.featuredImage),
  }
}

// --- Page transformer ---

export function transformPage(
  gqlPage: GqlPostBase & {
    parentDatabaseId?: number
    menuOrder?: number
    [key: string]: any
  }
): WPPage {
  const pageAcf: PageACF = {}

  // "elementsDePage" ACF field group — hero image + subtitle for all pages
  const heroData = gqlPage.elementsDePage?.hero
  if (heroData) {
    pageAcf.hero = {
      "sous-titre": heroData.sousTitre,
      image: heroData.image ? transformAcfMediaEdge(heroData.image) : undefined,
    }
  }

  // "pageDAccueil" — homepage-specific ACF fields (slogan, video)
  const accueilData = gqlPage.pageDAccueil
  if (accueilData) {
    if (accueilData.slogan) pageAcf.slogan = accueilData.slogan
    if (accueilData.video) pageAcf.video = accueilData.video
  }

  // Try page-specific ACF field groups that may have sous-titre
  if (!pageAcf.hero?.["sous-titre"]) {
    const pageSpecific =
      gqlPage.pageDevenirSocietaire || gqlPage.pageHistorique || gqlPage.pageServices
    if (pageSpecific?.sousTitre) {
      if (!pageAcf.hero) pageAcf.hero = {}
      pageAcf.hero["sous-titre"] = pageSpecific.sousTitre
    }
  }

  // Extract timeline from pageHistorique ACF field group
  const historiqueData = gqlPage.pageHistorique
  if (historiqueData?.timeline && Array.isArray(historiqueData.timeline)) {
    pageAcf.timeline = historiqueData.timeline.map((item: any) => ({
      titre: item.titre,
      annee: item.annee,
      descriptif: transformContentLinks(item.descriptif || ""),
      image: item.image ? transformAcfMediaEdge(item.image) : undefined,
    }))
  }

  // Extract devenir-sociétaire fields from pageDevenirSocietaire ACF field group
  // Remap GraphQL camelCase → REST-style keys expected by DevenirSocietairePage component
  const dsData = gqlPage.pageDevenirSocietaire
  if (dsData) {
    if (dsData.chapeau) pageAcf.chapeau = dsData.chapeau

    if (dsData.bandeau) {
      pageAcf.bandeau = {
        titre: dsData.bandeau.titre,
        cta: dsData.bandeau.cta
          ? {
              url: transformWordPressUrl(dsData.bandeau.cta.url),
              title: dsData.bandeau.cta.title,
              target: dsData.bandeau.cta.target,
            }
          : undefined,
        galerie: dsData.bandeau.images?.nodes
          ? {
              images: dsData.bandeau.images.nodes.map((img: any) => ({
                ID: img.databaseId,
                url: rewriteWordPressAssetUrl(img.sourceUrl),
                alt: img.altText || "",
              })),
            }
          : undefined,
      }
    }

    if (dsData.pourquoiRejoindre) {
      pageAcf.pourquoi_rejoindre = {
        titre: dsData.pourquoiRejoindre.titre,
        raisons: dsData.pourquoiRejoindre.raisons,
      }
    }

    if (dsData.ceQuestDevenirSocietaire) {
      const ce = dsData.ceQuestDevenirSocietaire
      pageAcf.ce_quest_devenir_societaire = {
        titre: ce.titre,
        motivation_1: ce.motivation1,
        motivation_2: ce.motivation2,
        motivation_3: ce.motivation3,
        motivation_4: ce.motivation4,
      }
    }

    if (dsData.questCeQueLaScic) {
      pageAcf["quest-ce_que_la_scic"] = {
        titre: dsData.questCeQueLaScic.titre,
        caracteristiques_de_la_scic: dsData.questCeQueLaScic.caracteristiquesDeLaScic,
      }
    }

    if (dsData.informationsSocietariat) {
      pageAcf.informations_societariat = dsData.informationsSocietariat
    }
  }

  // "pageStructures" — structures page section titles & images
  const psData = gqlPage.pageStructures
  if (psData) {
    pageAcf.page_structures = {
      structures_internes: psData.structuresInternes
        ? {
            titre_de_section: psData.structuresInternes.titreDeSection,
            image_de_section: transformAcfMediaEdge(psData.structuresInternes.imageDeSection),
          }
        : undefined,
      structures_hebergees: psData.structuresHebergees
        ? {
            titre_de_section: psData.structuresHebergees.titreDeSection,
            image_de_section: transformAcfMediaEdge(psData.structuresHebergees.imageDeSection),
          }
        : undefined,
    }
  }

  // "pagePatrimoine" — patrimoine page sections, valeurs, publics
  const patData = gqlPage.pagePatrimoine
  if (patData?.sections && Array.isArray(patData.sections) && patData.sections.length > 0) {
    pageAcf.patrimoine = {
      sections: patData.sections.map((item: any) => ({
        annee: item.annee,
        titre: item.titre,
        accroche: item.accroche,
        contenu: transformContentLinks(item.contenu || ""),
        citation: item.citation,
        image: item.image ? transformAcfMediaEdge(item.image) : undefined,
        video_url: item.videoUrl,
      })),
      valeurs: patData.valeurs || [],
      publics: patData.publics || [],
    }
  }

  const post = transformPost(gqlPage, pageAcf, "page")
  return {
    ...post,
    parent: gqlPage.parentDatabaseId || 0,
    menu_order: gqlPage.menuOrder || 0,
  } as WPPage
}

// --- ACF-specific transformers ---

// Helper: merge "structures"/"espacesDeTravail" main ACF + "mapPinPoints" ACF
// into a single flat ACF object (matching the REST API shape)
function mergeMainAndMapPinPoints(
  mainAcf: Record<string, any> | null | undefined,
  mapPinPoints: Record<string, any> | null | undefined
): Record<string, any> {
  const result: Record<string, any> = {}

  // Main ACF fields
  if (mainAcf) {
    if (mainAcf.nom !== undefined) result.nom = mainAcf.nom
    if (mainAcf.descriptif !== undefined) result.descriptif = mainAcf.descriptif
    if (mainAcf.photos) result.photos = mainAcf.photos
    if (mainAcf.video !== undefined) result.video = mainAcf.video
    if (mainAcf.lien) result.lien = mainAcf.lien
    if (mainAcf.localisation) result.localisation = mainAcf.localisation
  }

  // MapPinPoints fields (visibilite, position, images override)
  if (mapPinPoints) {
    if (result.nom === undefined && mapPinPoints.nom) result.nom = mapPinPoints.nom
    if (result.descriptif === undefined && mapPinPoints.descriptif)
      result.descriptif = mapPinPoints.descriptif
    if (mapPinPoints.visibilite !== undefined) result.visibilite = mapPinPoints.visibilite
    if (mapPinPoints.position) result.position = mapPinPoints.position
    if (mapPinPoints.images) result.images = mapPinPoints.images
  }

  return result
}

export function transformHebergementAcf(gqlPost: Record<string, any>): HebergementACF {
  // Hébergement has TWO field groups: "hebergements" (main) + "mapPinPoints" (map)
  const mainAcf = gqlPost.hebergements
  const mapPin = gqlPost.mapPinPoints
  const merged = mergeMainAndMapPinPoints(mainAcf, mapPin)

  if (!mainAcf && !mapPin) return {}

  return {
    nom: merged.nom,
    descriptif: transformContentLinks(merged.descriptif || ""),
    photos: transformAcfMediaConnection(merged.photos),
    video: merged.video,
    visibilite: merged.visibilite,
    images: transformAcfMediaConnection(merged.images),
    position: merged.position
      ? {
          latitude: merged.position.latitude || 0,
          longitude: merged.position.longitude || 0,
          altitude: merged.position.altitude || 0,
        }
      : undefined,
    localisation: transformGoogleMap(merged.localisation),
  }
}

export function transformActiviteAcf(gqlPost: Record<string, any>): ActiviteACF {
  const acf = gqlPost.activites
  if (!acf) return {}

  return {
    nom: acf.nom,
    descriptif: transformContentLinks(acf.descriptif || ""),
  }
}

export function transformStructureAcf(gqlPost: Record<string, any>): StructureACF {
  // Structure has TWO field groups: "structures" (main) + "mapPinPoints" (map)
  const mainAcf = gqlPost.structures
  const mapPin = gqlPost.mapPinPoints
  const merged = mergeMainAndMapPinPoints(mainAcf, mapPin)

  if (!mainAcf && !mapPin) return {}

  return {
    nom: merged.nom,
    type_de_structure: mainAcf?.typeDeStructure || undefined,
    descriptif: transformContentLinks(merged.descriptif || ""),
    photos: transformAcfMediaConnection(merged.photos),
    lien: merged.lien ? transformLink(merged.lien) : undefined,
    video: merged.video,
    visibilite: merged.visibilite,
    images: transformAcfMediaConnection(merged.images),
    position: merged.position
      ? {
          latitude: merged.position.latitude || 0,
          longitude: merged.position.longitude || 0,
          altitude: merged.position.altitude || 0,
        }
      : undefined,
    localisation: transformGoogleMap(merged.localisation),
  }
}

export function transformEvenementAcf(gqlPost: Record<string, any>): EvenementACF {
  const acf = gqlPost.evenements
  if (!acf) return { nom: gqlPost.title || "" }

  return {
    nom: acf.nom || gqlPost.title || "",
    descriptif: transformContentLinks(acf.descriptif || ""),
    date_de_debut: acf.dateDeDebut,
    date_de_fin: acf.dateDeFin,
    heure_de_debut: acf.heureDeDebut,
    heure_de_fin: acf.heureDeFin,
  }
}

export function transformPartenaireAcf(gqlPost: Record<string, any>): PartenaireACF {
  // Field group name is "partenaires" (plural) on the Partenaire type
  const acf = gqlPost.partenaires
  if (!acf) return { nom: "" }

  return {
    nom: acf.nom || "",
    logo: transformAcfMediaEdge(acf.logo),
    lien: acf.lien ? transformLink(acf.lien) : undefined,
    descriptif: transformContentLinks(acf.descriptif || ""),
  }
}

export function transformTeamMemberAcf(gqlPost: Record<string, any>): TeamMemberACF {
  const acf = gqlPost.membreDEquipe
  if (!acf) return {}

  return {
    binome_seul: acf.binomeSeul,
    descriptif: transformContentLinks(acf.descriptif || ""),
    photo: transformAcfMediaEdge(acf.photo),
    activite_principale: acf.activitePrincipale,
  }
}

export function transformEspaceDeTravailAcf(gqlPost: Record<string, any>): EspaceDeTravailACF {
  // EspaceDeTravail has TWO field groups: "espacesDeTravail" (main) + "mapPinPoints" (map)
  const mainAcf = gqlPost.espacesDeTravail
  const mapPin = gqlPost.mapPinPoints
  const merged = mergeMainAndMapPinPoints(mainAcf, mapPin)

  if (!mainAcf && !mapPin) return {}

  return {
    nom: merged.nom,
    descriptif: transformContentLinks(merged.descriptif || ""),
    photos: transformAcfMediaConnection(merged.photos),
    video: merged.video,
    visibilite: merged.visibilite,
    images: transformAcfMediaConnection(merged.images),
    position: merged.position
      ? {
          latitude: merged.position.latitude || 0,
          longitude: merged.position.longitude || 0,
          altitude: merged.position.altitude || 0,
        }
      : undefined,
    localisation: transformGoogleMap(merged.localisation),
  }
}

// --- Sejour ACF transformer ---

export function transformSejourAcf(gqlPost: Record<string, any>): SejourACF {
  const acf = gqlPost.sejours
  if (!acf) return { nom: gqlPost.title || "" }

  return {
    nom: acf.nom || gqlPost.title || "",
    descriptif: transformContentLinks(acf.descriptif || ""),
  }
}

// --- Menu transformer ---

export function transformMenuItems(
  gqlMenuItems: Array<{
    databaseId: number
    label: string
    url: string
    parentDatabaseId?: number | null
    order?: number
  }>
): WPMenuItem[] {
  // Build flat list first
  const flat: WPMenuItem[] = gqlMenuItems.map((item) => ({
    id: item.databaseId,
    title: item.label,
    url: transformWordPressUrl(item.url),
    parent: item.parentDatabaseId || 0,
    order: item.order || 0,
  }))

  // Build tree structure
  const byId = new Map<number, WPMenuItem>()
  flat.forEach((item) => byId.set(item.id, { ...item, children: [] }))

  const roots: WPMenuItem[] = []
  byId.forEach((item) => {
    if (item.parent && byId.has(item.parent)) {
      const parent = byId.get(item.parent)!
      if (!parent.children) parent.children = []
      parent.children.push(item)
    } else {
      roots.push(item)
    }
  })

  return roots.sort((a, b) => a.order - b.order)
}

// --- Taxonomy transformer ---

export function transformTerm(gqlTerm: {
  databaseId: number
  name: string
  slug: string
  count?: number
  description?: string
  link?: string
  taxonomyName?: string
}): WPTerm {
  return {
    id: gqlTerm.databaseId,
    name: gqlTerm.name,
    slug: gqlTerm.slug,
    count: gqlTerm.count || 0,
    description: gqlTerm.description || "",
    link: gqlTerm.link || "",
    taxonomy: gqlTerm.taxonomyName || "",
  }
}

// --- Global Options transformer ---

interface GqlGlobalOptionsResponse {
  optionsGlobales: {
    menu?: {
      lienDuCtaDeBarreSuperieure?: { url?: string; title?: string; target?: string }
      miniatureDuMegamenu?: {
        titreCta1?: string
        lienCta1?: { url?: string; title?: string; target?: string }
        titreCta2?: string
        lienCta2?: { url?: string; title?: string; target?: string }
        image?: { node?: GqlMediaItem }
      }
    }
  }
}

export function transformGlobalOptions(data: GqlGlobalOptionsResponse): GlobalOptionsACF | null {
  const menu = data.optionsGlobales?.menu
  if (!menu) return null

  const megamenu = menu.miniatureDuMegamenu

  return {
    lien_du_cta_de_barre_superieure: transformLink(menu.lienDuCtaDeBarreSuperieure),
    miniature_du_megamenu: megamenu
      ? {
          titre_cta_1: megamenu.titreCta1,
          lien_cta_1: transformLink(megamenu.lienCta1),
          titre_cta_2: megamenu.titreCta2,
          lien_cta_2: transformLink(megamenu.lienCta2),
          image: transformAcfMediaEdge(megamenu.image),
        }
      : undefined,
  }
}
