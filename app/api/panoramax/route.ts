import { NextRequest, NextResponse } from 'next/server'

const PANORAMAX_API_URL = 'https://api.panoramax.ign.fr/api'

/** Valide que bbox contient 4 nombres séparés par des virgules */
function isValidBbox(bbox: string): boolean {
  const parts = bbox.split(",")
  if (parts.length !== 4) return false
  return parts.every((p) => !isNaN(Number(p)) && isFinite(Number(p)))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bbox = searchParams.get('bbox')
  const limitRaw = searchParams.get('limit') || '10'

  if (!bbox || !isValidBbox(bbox)) {
    return NextResponse.json({ error: 'Invalid or missing bbox parameter' }, { status: 400 })
  }

  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 10, 1), 50)

  try {
    const url = `${PANORAMAX_API_URL}/search?bbox=${encodeURIComponent(bbox)}&limit=${limit}`
    // fetch panoramax

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Hermitage-VirtualTour/1.0'
      }
    })

    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Panoramax API error ${response.status}: ${errorText}`)
      return NextResponse.json({ type: 'FeatureCollection', features: [] })
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      const res = NextResponse.json(data)
      res.headers.set("Cache-Control", "public, max-age=900, s-maxage=900")
      return res
    } else {
      const text = await response.text()
      console.error(`Panoramax API unexpected content-type: ${contentType}`)
      return NextResponse.json({ type: 'FeatureCollection', features: [] })
    }
  } catch (error) {
    console.error('Panoramax API error:', error)
    return NextResponse.json({ type: 'FeatureCollection', features: [] })
  }
}
