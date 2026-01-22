export interface PanoramaxPicture {
  id: string
  geometry: {
    type: 'Point'
    coordinates: [number, number, number] // [longitude, latitude, altitude]
  }
  properties: {
    timestamp: string
    heading?: number
    viewer_url: string
    assets: {
      sd?: { href: string }
      hd?: { href: string }
      fhd?: { href: string }
      thumb?: { href: string }
    }
  }
}

export interface PanoramaxCollection {
  type: 'FeatureCollection'
  features: PanoramaxPicture[]
}

// API Panoramax publique - instance IGN France
const PANORAMAX_API_URL = 'https://api.panoramax.ign.fr/api'

/**
 * Recherche les photos Panoramax proches d'une position GPS
 * @param latitude Latitude du point
 * @param longitude Longitude du point
 * @param radius Rayon de recherche en mètres (défaut: 100m)
 * @returns Liste des photos trouvées
 */
export async function searchPanoramaxPictures(
  latitude: number,
  longitude: number,
  radius: number = 100
): Promise<PanoramaxPicture[]> {
  try {
    const lat = Number(latitude)
    const lon = Number(longitude)
    
    if (isNaN(lat) || isNaN(lon)) {
      console.error('[v0] Panoramax - Invalid coordinates:', { latitude, longitude })
      return []
    }
    
    console.warn(`[v0] Panoramax - Searching pictures near ${lat},${lon} within ${radius}m`)
    
    const radiusDegrees = radius / 111000
    const minLon = lon - radiusDegrees
    const minLat = lat - radiusDegrees
    const maxLon = lon + radiusDegrees
    const maxLat = lat + radiusDegrees
    
    const bbox = `${minLon.toFixed(6)},${minLat.toFixed(6)},${maxLon.toFixed(6)},${maxLat.toFixed(6)}`
    
    const url = `/api/panoramax?bbox=${bbox}&limit=10`
    
    console.warn(`[v0] Panoramax - Request URL: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`[v0] Panoramax - API returned ${response.status}`)
      return []
    }

    const data: PanoramaxCollection = await response.json()
    console.warn(`[v0] Panoramax - Found ${data.features?.length || 0} pictures`)

    return data.features || []
  } catch (error) {
    console.error('[v0] Panoramax - Error fetching pictures:', error)
    return []
  }
}

/**
 * Récupère l'URL du viewer Panoramax pour une photo
 * @param pictureId ID de la photo
 * @returns URL du viewer
 */
export function getPanoramaxViewerUrl(pictureId: string): string {
  return `https://panoramax.ign.fr/#focus=pic&map=18/${pictureId}&pic=${pictureId}`
}

/**
 * Récupère l'URL de la miniature d'une photo
 * @param picture Photo Panoramax
 * @returns URL de la miniature
 */
export function getPanoramaxThumbnail(picture: PanoramaxPicture): string | null {
  return picture.properties.assets.thumb?.href || 
         picture.properties.assets.sd?.href || 
         null
}

/**
 * Récupère l'URL haute définition d'une photo
 * @param picture Photo Panoramax
 * @returns URL HD
 */
export function getPanoramaxHD(picture: PanoramaxPicture): string | null {
  return picture.properties.assets.fhd?.href || 
         picture.properties.assets.hd?.href || 
         picture.properties.assets.sd?.href || 
         null
}
