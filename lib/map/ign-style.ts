import type { StyleSpecification } from "maplibre-gl"

export const IGN_SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  name: "IGN Satellite",
  sources: {
    "ign-ortho": {
      type: "raster",
      tiles: [
        "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg",
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "ign-ortho-layer",
      type: "raster",
      source: "ign-ortho",
      paint: {
        "raster-opacity": 1.0,
      },
    },
  ],
}

export const IGN_PLAN_STYLE: StyleSpecification = {
  version: 8,
  name: "IGN Plan",
  sources: {
    "ign-plan": {
      type: "raster",
      tiles: [
        "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png",
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "ign-plan-layer",
      type: "raster",
      source: "ign-plan",
      paint: {
        "raster-opacity": 1.0,
      },
    },
  ],
}

/** Centre par défaut — L'Hermitage Saint-Antoine */
export const DEFAULT_CENTER = { lng: 3.128, lat: 49.437 } as const
export const DEFAULT_ZOOM = 16
