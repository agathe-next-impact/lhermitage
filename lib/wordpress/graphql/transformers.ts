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
  ServiceACF,
  SeminairesACF,
  RecrutementACF,
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
      images_laterales: heroData.imagesLaterales?.nodes?.map(
        (node: { sourceUrl: string; altText?: string }) => ({
          url: node.sourceUrl,
          alt: node.altText || "",
        })
      ),
    }
  }

  // "pageDAccueil" — homepage-specific ACF fields (slogan, video)
  const accueilData = gqlPage.pageDAccueil
  if (accueilData) {
    if (accueilData.slogan) pageAcf.slogan = accueilData.slogan
    if (accueilData.video) pageAcf.video = accueilData.video
    const selfHosted = accueilData.videoAutoHerbegee?.node
    if (selfHosted?.mediaItemUrl) {
      pageAcf.video_auto_hebergee = {
        url: selfHosted.mediaItemUrl,
        mime_type: selfHosted.mimeType || "video/mp4",
      }
    }
  }

  // Try page-specific ACF field groups that may have sous-titre
  if (!pageAcf.hero?.["sous-titre"]) {
    const pageSpecific =
      gqlPage.pageDevenirSocietaire || gqlPage.pageHistoire || gqlPage.pageServices
    if (pageSpecific?.sousTitre) {
      if (!pageAcf.hero) pageAcf.hero = {}
      pageAcf.hero["sous-titre"] = pageSpecific.sousTitre
    }
  }

  // Extract timeline from pageHistoire ACF field group
  const historiqueData = gqlPage.pageHistoire
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

  // "pageLocalisation" — localisation page: adresse, moyens d'accès, logistique
  const locData = gqlPage.pageLocalisation
  if (locData) {
    const hasContent =
      locData.adresse?.ligne1 ||
      locData.adresse?.ligne2 ||
      (locData.moyensAcces && locData.moyensAcces.length > 0) ||
      locData.logistique?.titre
    if (hasContent) {
      pageAcf.localisation_page = {
        adresse: locData.adresse
          ? {
              ligne_1: locData.adresse.ligne1,
              ligne_2: locData.adresse.ligne2,
              description: locData.adresse.description,
              image: locData.adresse.image
                ? transformAcfMediaEdge(locData.adresse.image)
                : undefined,
              carte_url: locData.adresse.carteUrl,
            }
          : undefined,
        moyens_acces: locData.moyensAcces?.map((item: any) => ({
          titre: item.titre,
          icone: item.icone,
          couleur: item.couleur,
          duree: item.duree,
          contenu: item.contenu ? transformContentLinks(item.contenu) : undefined,
        })),
        logistique: locData.logistique
          ? {
              titre: locData.logistique.titre,
              texte: locData.logistique.texte,
              services: locData.logistique.services,
              note: locData.logistique.note,
              image: locData.logistique.image
                ? transformAcfMediaEdge(locData.logistique.image)
                : undefined,
            }
          : undefined,
      }
    }
  }

  // "pageHoraires" — horaires page: café, domaine, séjours
  // ACF wraps fields in a "horairesPage" group inside the field group
  const horData = gqlPage.pageHoraires?.horairesPage
  if (horData) {
    const hasContent =
      horData.cafe?.titre ||
      horData.domaine?.titre ||
      horData.sejours?.titre ||
      horData.accroche ||
      horData.bonASavoir
    if (hasContent) {
      pageAcf.horaires_page = {
        image_ambiance: horData.imageAmbiance
          ? transformAcfMediaEdge(horData.imageAmbiance)
          : undefined,
        accroche: horData.accroche,
        bon_a_savoir: horData.bonASavoir,
        cafe: horData.cafe
          ? {
              titre: horData.cafe.titre,
              sous_titre: horData.cafe.sousTitre,
              // ACF select fields return arrays — unwrap to single strings
              horaires: horData.cafe.horaires?.map((h: any) => ({
                jour: Array.isArray(h.jour) ? h.jour[0] : h.jour,
                heures: h.heures,
                ferme: h.ferme,
                note: h.note,
                evenement: h.evenement,
              })),
              encarts: horData.cafe.encarts?.map((e: any) => ({
                titre: e.titre,
                texte: e.texte,
                icone: Array.isArray(e.icone) ? e.icone[0] : e.icone,
                couleur: e.couleur,
              })),
            }
          : undefined,
        domaine: horData.domaine
          ? {
              titre: horData.domaine.titre,
              sous_titre: horData.domaine.sousTitre,
              texte: horData.domaine.texte,
              image: horData.domaine.image
                ? transformAcfMediaEdge(horData.domaine.image)
                : undefined,
              badges: horData.domaine.badges,
              note: horData.domaine.note,
            }
          : undefined,
        sejours: horData.sejours
          ? {
              titre: horData.sejours.titre,
              sous_titre: horData.sejours.sousTitre,
              accroche: horData.sejours.accroche,
              texte: horData.sejours.texte,
            }
          : undefined,
      }
    }
  }

  // "pageContacts" — contacts page: team members repeater
  const contactsData = gqlPage.pageContacts?.contactsEquipe
  if (Array.isArray(contactsData) && contactsData.length > 0) {
    pageAcf.contacts_equipe = contactsData.map((member: any) => ({
      nom: member.nom,
      role: member.role,
      organisation: member.organisation || undefined,
      photo: member.photo ? transformAcfMediaEdge(member.photo) : undefined,
      email: member.email || undefined,
      telephones: member.telephones?.length ? member.telephones : undefined,
      adresse: member.adresse || undefined,
    }))
  }

  // "pagePatrimoine" — patrimoine page sections, valeurs, publics
  const patData = gqlPage.pagePatrimoine
  if (patData?.sections && Array.isArray(patData.sections) && patData.sections.length > 0) {
    pageAcf.patrimoine = {
      introduction: patData.introduction
        ? {
            citation: patData.introduction.citation,
            texte: transformContentLinks(patData.introduction.texte || ""),
          }
        : undefined,
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

  // "pageRecrutement" — recrutement/engagement pages (offres, stages, alternance, etc.)
  const recData = gqlPage.pageRecrutement
  if (recData) {
    const recrutement = transformRecrutementData(recData)
    if (recrutement) {
      pageAcf.recrutement = recrutement
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
    if (result.nom === undefined && mapPinPoints.nomPin) result.nom = mapPinPoints.nomPin
    if (result.descriptif === undefined && mapPinPoints.descriptif)
      result.descriptif = mapPinPoints.descriptif
    // Toujours conserver le descriptif spécifique au pin point
    if (mapPinPoints.descriptif) result.descriptifPinPoint = mapPinPoints.descriptif
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
    descriptifPinPoint: merged.descriptifPinPoint,
    disponibilite: mainAcf?.disponibilite,
    capacite_daccueil:
      mainAcf?.capaciteDaccueil != null ? Number(mainAcf.capaciteDaccueil) : undefined,
    repartition_des_chambres: mainAcf?.repartitionDesChambres,
    commodites: mainAcf?.commodites,
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
    descriptifPinPoint: merged.descriptifPinPoint,
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
  const acf = gqlPost.evenementFields
  if (!acf) return {}

  return {
    eventDateStart: acf.eventdatestart,
    eventDateEnd: acf.eventDateEnd,
    eventDateLabel: acf.eventDateLabel,
    eventPitch: acf.eventPitch ? transformContentLinks(acf.eventPitch) : undefined,
    eventVenue: acf.eventVenue,
    eventVenueLabel: acf.eventVenueLabel,
    eventAddress: acf.eventAddress,
    eventZip: acf.eventZip,
    eventCity: acf.eventCity,
    eventAccessType: acf.eventAccessType,
    eventCapacityLimited: acf.eventCapacityLimited,
    eventCapacityTotal: acf.eventCapacityTotal,
    eventBookingRequired: acf.eventBookingRequired,
    eventBookingType: acf.eventBookingType,
    eventBookingCtaLabel: acf.eventBookingCtaLabel,
    eventFoodAvailable: acf.eventFoodAvailable,
    eventFoodDescription: acf.eventFoodDescription,
    eventFoodLocal: acf.eventFoodLocal,
    eventContactPhone: acf.eventContactPhone,
    eventContactEmail: acf.eventContactEmail,
    eventIcon: acf.eventIcon,
    eventColorAccent: acf.eventColorAccent,
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
    descriptifPinPoint: merged.descriptifPinPoint,
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

export function transformServiceAcf(_gqlPost: Record<string, any>): ServiceACF {
  const acf = _gqlPost.pageServices || {}
  return {
    nom: acf.nom || _gqlPost.title || undefined,
    descriptif: acf.descriptif || undefined,
    photos: transformAcfMediaConnection(acf.photos),
  }
}

// --- Séminaires page transformer (standalone, called from separate query) ---

export function transformSeminairesData(semData: Record<string, any>): SeminairesACF | null {
  const hero = semData.heroSeminaires
  const promesse = semData.promesse
  const espaces = semData.espacesTravail
  const activites = semData.activitesTeambuilding
  const resto = semData.restauration
  const hebs = semData.hebergementsSeminaires
  const temos = semData.temoignages
  const contact = semData.contact

  const hasSeminairesContent =
    hero?.accroche ||
    promesse?.titre ||
    espaces?.titre ||
    activites?.titre ||
    resto?.services?.nodes?.length

  if (!hasSeminairesContent) return null

  return {
    hero_seminaires: hero
      ? {
          video: hero.video?.node?.mediaItemUrl
            ? {
                url: rewriteWordPressAssetUrl(hero.video.node.mediaItemUrl),
                mime_type: hero.video.node.mimeType || "video/mp4",
              }
            : undefined,
          image: transformAcfMediaEdge(hero.image),
          accroche: hero.accroche,
          sous_titre: hero.sousTitre,
          cta_texte: hero.ctaTexte,
          cta_lien: transformLink(hero.ctaLien),
        }
      : undefined,
    promesse: promesse
      ? {
          titre: promesse.titre,
          storytelling: transformContentLinks(promesse.storytelling || ""),
          image: transformAcfMediaEdge(promesse.image),
          chiffres_cles: promesse.chiffresCles || [],
        }
      : undefined,
    espaces_travail: espaces
      ? {
          titre: espaces.titre,
          introduction: espaces.introduction,
          espaces: (espaces.espaces?.nodes || []).map((node: any) =>
            transformPost(node, transformEspaceDeTravailAcf(node), "espace_de_travail")
          ),
          facilitation: espaces.facilitation
            ? {
                titre: espaces.facilitation.titre,
                contenu: transformContentLinks(espaces.facilitation.contenu || ""),
                badge: espaces.facilitation.badge,
              }
            : undefined,
        }
      : undefined,
    activites_teambuilding: activites
      ? {
          titre: activites.titre,
          sous_titre: activites.sousTitre,
          activites: (activites.activites?.nodes || []).map((node: any) =>
            transformPost(node, transformActiviteAcf(node), "activite")
          ),
        }
      : undefined,
    restauration: resto
      ? {
          services: (resto.services?.nodes || []).map((node: any) =>
            transformPost(node, transformServiceAcf(node), "service")
          ),
        }
      : undefined,
    hebergements_seminaires: hebs
      ? {
          titre: hebs.titre,
          sous_titre: hebs.sousTitre,
          hebergements: (hebs.hebergements?.nodes || []).map((node: any) =>
            transformPost(node, transformHebergementAcf(node), "hebergement")
          ),
        }
      : undefined,
    temoignages: temos
      ? {
          titre: temos.titre,
          citations: temos.citations || [],
          logos: transformAcfMediaConnection(temos.logos),
        }
      : undefined,
    contact: contact
      ? {
          titre: contact.titre,
          conciergerie: transformContentLinks(contact.conciergerie || ""),
          nom_contact: contact.nomContact,
          email: contact.email,
          telephone: contact.telephone,
          photo: transformAcfMediaEdge(contact.photo),
          cta_texte: contact.ctaTexte,
          cta_lien: transformLink(contact.ctaLien),
        }
      : undefined,
  }
}

// --- Sejour ACF transformer ---

export function transformSejourAcf(gqlPost: Record<string, any>): SejourACF {
  const acf = gqlPost.sejours
  if (!acf) return { nom: gqlPost.title || "" }

  const result: SejourACF = {
    nom: acf.nom || gqlPost.title || "",
    descriptif: transformContentLinks(acf.descriptif || ""),
  }

  // Transform relationship field: hebergement (ContentNode[] → WPPost<HebergementACF>[])
  const hebNodes = acf.hebergement?.nodes
  if (hebNodes?.length) {
    result.hebergements = {
      hebergements: hebNodes.map((node: any) => ({
        hebergement: transformPost<HebergementACF>(
          node,
          transformHebergementAcf(node),
          "hebergement"
        ),
      })),
    }
  }

  // Transform relationship field: activite (ContentNode[] → WPPost<ActiviteACF>[])
  const actNodes = acf.activite?.nodes
  if (actNodes?.length) {
    result.activites = {
      activite: actNodes.map((node: any) => ({
        activite: transformPost<ActiviteACF>(node, transformActiviteAcf(node), "activite"),
      })),
    }
  }

  return result
}

// --- Recrutement page transformer ---

export function transformRecrutementData(
  recData: Record<string, any>
): RecrutementACF | null {
  if (!recData) return null

  const intro = recData.introduction
  const offres = recData.offres
  const cadre = recData.cadreDeVie
  const temos = recData.temoignages
  const cand = recData.candidature

  const hasContent =
    intro?.titre || offres?.length || cadre?.titre || temos?.length || cand?.titre

  if (!hasContent) return null

  return {
    introduction: intro
      ? {
          titre: intro.titre,
          texte: transformContentLinks(intro.texte || ""),
          chiffres_cles: intro.chiffresCles?.map((c: any) => ({
            icone: c.icone,
            categorie: c.categorie,
            valeur: c.valeur,
            description: c.description,
          })),
        }
      : undefined,
    offres: offres?.map((o: any) => ({
      icone: o.icone,
      titre: o.titre,
      descriptif: o.descriptif,
      missions: o.missions,
      profil: o.profil,
      cta_texte: o.ctaTexte,
      cta_lien: o.ctaLien,
    })),
    cadre_de_vie: cadre
      ? {
          titre: cadre.titre,
          blocs: cadre.blocs?.map((b: any) => ({
            icone: b.icone,
            titre: b.titre,
            texte_intro: b.texteIntro,
            elements: b.elements,
            note: b.note,
            image: b.image ? transformAcfMediaEdge(b.image) : undefined,
          })),
        }
      : undefined,
    temoignages: temos?.map((t: any) => ({
      citation: t.citation,
      auteur: t.auteur,
      role: t.role,
      photo: t.photo ? transformAcfMediaEdge(t.photo) : undefined,
    })),
    candidature: cand
      ? {
          titre: cand.titre,
          texte: transformContentLinks(cand.texte || ""),
          email: cand.email,
          email_secondaire: cand.emailSecondaire,
          activer_formulaire: cand.activerFormulaire,
          champs: cand.champs?.map((ch: any) => ({
            label: ch.label,
            type_champ: ch.typeChamp,
            requis: ch.requis,
            options: ch.options,
          })),
        }
      : undefined,
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
