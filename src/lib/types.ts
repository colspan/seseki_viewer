import type { Feature, FeatureCollection, Geometry } from 'geojson'

export interface Prefecture {
  id: string
  prefecture_jp: string
  prefecture_en: string
  scale: number
}

export interface ExampleDatasetEntry {
  file: string
  title: string
  file_description?: string
  column_description?: string
  right_holder: string
  cc?: boolean
  url?: string
  target_prefectures: number[]
}

export type CsvRow = Record<string, string | number | null | undefined>

export interface CsvDataset {
  columns: string[]
  rows: CsvRow[]
}

export interface CommuneProperties {
  N03_001?: string
  N03_003?: string
  N03_004?: string
  N03_007?: string
  [key: string]: unknown
}

export interface CommuneFeature extends Feature<Geometry, CommuneProperties> {
  communeId: number
  prefecture: string
  name: string
}

export interface CommuneFeatureCollection extends FeatureCollection<
  Geometry,
  CommuneProperties
> {
  features: CommuneFeature[]
}

export interface GeoJsonLoadResult {
  geoJson: CommuneFeatureCollection
  communes: string[]
  idMap: Record<string, number[]>
  idToCommune: Record<number, string>
  geoJsonFiles: string[]
}
