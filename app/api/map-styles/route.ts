import { NextResponse } from "next/server"

// Server-side route to provide map styles with Mapbox token
export async function GET() {
  const mapboxToken = process.env.MAPBOX_TOKEN

  if (!mapboxToken) {
    return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
  }

  const satelliteStyle = {
    version: 8,
    name: "Mapbox Satellite",
    sources: {
      "mapbox-satellite": {
        type: "raster",
        tiles: [`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg?access_token=${mapboxToken}`],
        tileSize: 256,
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#F5EFE6",
        },
      },
      {
        id: "mapbox-satellite",
        type: "raster",
        source: "mapbox-satellite",
        paint: {
          "raster-opacity": 1.0,
        },
      },
    ],
  }

  const terrainStyle = {
    version: 8,
    name: "Mapbox Streets",
    sources: {
      "mapbox-streets": {
        type: "raster",
        tiles: [`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`],
        tileSize: 512,
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "mapbox-streets",
        type: "raster",
        source: "mapbox-streets",
      },
    ],
  }

  return NextResponse.json({
    mapboxToken,
    satelliteStyle,
    terrainStyle,
  })
}
