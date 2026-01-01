import { NextRequest, NextResponse } from 'next/server'

const PANORAMAX_API_URL = 'https://api.panoramax.ign.fr/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bbox = searchParams.get('bbox')
  const limit = searchParams.get('limit') || '10'

  if (!bbox) {
    return NextResponse.json({ error: 'bbox parameter is required' }, { status: 400 })
  }

  try {
    const url = `${PANORAMAX_API_URL}/search?bbox=${bbox}&limit=${limit}`
    console.log(`[v0] Panoramax API - Fetching: ${url}`)

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Hermitage-VirtualTour/1.0'
      }
    })

    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Panoramax API - Error ${response.status}: ${errorText}`)
      return NextResponse.json({ type: 'FeatureCollection', features: [] })
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log(`[v0] Panoramax API - Found ${data.features?.length || 0} pictures`)
      return NextResponse.json(data)
    } else {
      const text = await response.text()
      console.error(`[v0] Panoramax API - Unexpected content-type: ${contentType}, body: ${text}`)
      return NextResponse.json({ type: 'FeatureCollection', features: [] })
    }
  } catch (error) {
    console.error('[v0] Panoramax API - Error:', error)
    return NextResponse.json({ type: 'FeatureCollection', features: [] })
  }
}
