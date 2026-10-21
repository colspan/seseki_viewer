import type { FeatureCollection, Geometry } from 'geojson'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

import type {
  CommuneFeature,
  CommuneFeatureCollection,
  CommuneProperties,
  GeoJsonLoadResult,
} from './types'

const DEFAULT_EXCEPTIONS = [
  '色丹郡色丹村',
  '国後郡泊村',
  '国後郡留夜別村',
  '択捉郡留別村',
  '紗那郡紗那村',
  '蘂取郡蘂取村',
  '所属未定地',
]

interface LoadOptions {
  exceptions?: string[]
  signal?: AbortSignal
}

async function loadPrefecture(
  file: string,
  exceptions: string[],
  signal?: AbortSignal,
): Promise<Omit<GeoJsonLoadResult, 'geoJsonFiles'>> {
  const response = await fetch(file, { signal })
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.status}`)
  }

  const topology = (await response.json()) as Topology
  const objectName = Object.keys(topology.objects)[0]
  const topologyObject = topology.objects[objectName] as GeometryCollection
  const loaded = feature(topology, topologyObject) as FeatureCollection<
    Geometry,
    CommuneProperties
  >

  const communes: string[] = []
  const idMap: Record<string, number[]> = {}
  const idToCommune: Record<number, string> = {}

  const register = (name: string, communeId: number) => {
    const ids = idMap[name] ?? []
    if (!ids.includes(communeId)) ids.push(communeId)
    idMap[name] = ids
  }

  const features = loaded.features
    .map(featureItem => {
      const properties = featureItem.properties ?? {}

      if (!properties.N03_007) return null

      const communeId = Number(properties.N03_007)
      const prefecture = properties.N03_001 ?? ''
      const name = `${properties.N03_003 ?? ''}${properties.N03_004 ?? ''}`

      return {
        ...featureItem,
        communeId,
        prefecture,
        name,
      } as CommuneFeature
    })
    .filter((featureItem): featureItem is CommuneFeature => featureItem !== null)
    .filter(featureItem => !exceptions.includes(featureItem.name))

  features.forEach(featureItem => {
    const properties = featureItem.properties ?? {}

    if (!communes.includes(featureItem.name)) {
      communes.push(featureItem.name)
    }

    if (properties.N03_003) {
      register(properties.N03_003, featureItem.communeId)
      register(featureItem.name, featureItem.communeId)

      if (properties.N03_003.slice(-1) === '郡' && properties.N03_004) {
        register(properties.N03_004, featureItem.communeId)
      }
    }

    if (properties.N03_004) {
      register(properties.N03_004, featureItem.communeId)
    }

    idToCommune[featureItem.communeId] = featureItem.name
  })

  return {
    geoJson: {
      ...loaded,
      features,
    } as CommuneFeatureCollection,
    communes,
    idMap,
    idToCommune,
  }
}

export async function loadGeoJsonFiles(
  files: string[],
  options: LoadOptions = {},
): Promise<GeoJsonLoadResult> {
  const exceptions = options.exceptions ?? DEFAULT_EXCEPTIONS
  const results = await Promise.all(
    files.map(file => loadPrefecture(file, exceptions, options.signal)),
  )

  const merged: CommuneFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  }
  const communes: string[] = []
  const idMap: Record<string, number[]> = {}
  const idToCommune: Record<number, string> = {}

  results.forEach(result => {
    merged.features.push(...result.geoJson.features)

    result.communes.forEach(commune => {
      if (!communes.includes(commune)) communes.push(commune)
    })

    Object.assign(idMap, result.idMap)
    Object.assign(idToCommune, result.idToCommune)
  })

  return {
    geoJson: merged,
    communes,
    idMap,
    idToCommune,
    geoJsonFiles: files,
  }
}
