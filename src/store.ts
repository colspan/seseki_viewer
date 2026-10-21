import { create } from 'zustand'

import { parseCsvBuffer } from './lib/csv'
import { loadGeoJsonFiles } from './lib/geoJsonLoader'
import { prefecturesFromIds } from './lib/params'
import type {
  CommuneFeatureCollection,
  CsvDataset,
  ExampleDatasetEntry,
  Prefecture,
} from './lib/types'

type DataSource = 'example' | 'local' | null

interface SesekiState {
  areas: Prefecture[]
  idMap: Record<string, number[]>
  idToCommune: Record<number, string>
  communes: string[]
  geoJson: CommuneFeatureCollection | null
  geoJsonFiles: string[]
  exampleDatasetDef: ExampleDatasetEntry[]
  exampleDataEntry: ExampleDatasetEntry | null
  geoStatisticalData: CsvDataset | null
  geoStatisticalDataColumn: number
  dataSource: DataSource
  dataKey: string | null
  sourceName: string | null
  showSpreadSheet: boolean
  showExampleDataSelector: boolean
  detailViewTarget: number | null
  detailViewTargetName: string | null
  tooltipTarget: number | null
  loading: boolean
  error: string | null
  initialized: boolean

  initialize: () => Promise<void>
  syncFromUrl: (areaIds: string[], examplePath: string | null) => Promise<void>
  refresh: () => Promise<void>
  loadLocalCsv: (filename: string, buffer: ArrayBuffer) => Promise<void>
  changeColumn: (column: number) => void
  openSpreadSheet: () => void
  closeSpreadSheet: (data: CsvDataset | null) => void
  openExampleSelector: () => void
  closeExampleSelector: () => void
  openDetailView: (communeId: number, communeName?: string | null) => void
  closeDetailView: () => void
  openTooltip: (communeId: number) => void
  closeTooltip: () => void
  clearError: () => void
}

type SetState = (partial: Partial<SesekiState>) => void

let geoController: AbortController | null = null
let dataController: AbortController | null = null
let initPromise: Promise<void> | null = null
let refreshToken = 0

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

async function loadGeoJsonForAreas(areas: Prefecture[], set: SetState): Promise<void> {
  geoController?.abort()

  if (areas.length === 0) {
    set({
      geoJson: null,
      geoJsonFiles: [],
      idMap: {},
      idToCommune: {},
      communes: [],
    })
    return
  }

  const controller = new AbortController()
  geoController = controller
  const files = areas.map((area) => `data/${area.id}_${area.prefecture_en}_topo.json`)

  try {
    const result = await loadGeoJsonFiles(files, {
      signal: controller.signal,
    })

    if (controller.signal.aborted) return

    set({
      geoJson: result.geoJson,
      geoJsonFiles: result.geoJsonFiles,
      idMap: result.idMap,
      idToCommune: result.idToCommune,
      communes: result.communes,
    })
  } catch (error) {
    if (isAbortError(error)) return

    set({
      error: errorMessage(error),
      geoJson: null,
      geoJsonFiles: [],
      idMap: {},
      idToCommune: {},
      communes: [],
    })
  }
}

async function loadExampleData(entry: ExampleDatasetEntry, set: SetState): Promise<void> {
  dataController?.abort()
  const controller = new AbortController()
  dataController = controller

  try {
    const response = await fetch(entry.file, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Failed to load ${entry.file}: ${response.status}`)
    }

    const dataset = parseCsvBuffer(await response.arrayBuffer())
    if (controller.signal.aborted) return

    set({
      geoStatisticalData: dataset,
      geoStatisticalDataColumn: 0,
      dataSource: 'example',
      dataKey: entry.file,
      sourceName: entry.title,
    })
  } catch (error) {
    if (isAbortError(error)) return

    set({ error: errorMessage(error) })
  }
}

export const useSesekiStore = create<SesekiState>((set, get) => ({
  areas: [],
  idMap: {},
  idToCommune: {},
  communes: [],
  geoJson: null,
  geoJsonFiles: [],
  exampleDatasetDef: [],
  exampleDataEntry: null,
  geoStatisticalData: null,
  geoStatisticalDataColumn: 0,
  dataSource: null,
  dataKey: null,
  sourceName: null,
  showSpreadSheet: false,
  showExampleDataSelector: false,
  detailViewTarget: null,
  detailViewTargetName: null,
  tooltipTarget: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (initPromise) return initPromise

    initPromise = (async () => {
      set({ loading: true, error: null })

      try {
        const response = await fetch('params/example_dataset_def.json')
        if (!response.ok) {
          throw new Error(
            `Failed to load example dataset definitions: ${response.status}`,
          )
        }

        const exampleDatasetDef = (await response.json()) as ExampleDatasetEntry[]
        set({ exampleDatasetDef, initialized: true })
      } catch (error) {
        set({
          error: errorMessage(error),
          initialized: true,
          loading: false,
        })
      }
    })()

    return initPromise
  },

  syncFromUrl: async (areaIds, examplePath) => {
    if (!get().initialized) return

    const areas = prefecturesFromIds(areaIds)
    const exampleDataEntry = examplePath
      ? (get().exampleDatasetDef.find((entry) => entry.file === examplePath) ?? null)
      : null

    set({ areas, exampleDataEntry })

    if (areas.length === 0) {
      const previousSource = get().dataSource
      set({
        geoJson: null,
        geoJsonFiles: [],
        geoStatisticalData:
          previousSource === 'example' ? null : get().geoStatisticalData,
        dataSource: previousSource === 'example' ? null : previousSource,
        dataKey: previousSource === 'example' ? null : get().dataKey,
        sourceName: previousSource === 'example' ? null : get().sourceName,
        loading: false,
      })
      return
    }

    await get().refresh()
  },

  refresh: async () => {
    const token = ++refreshToken
    const { areas, exampleDataEntry, dataSource } = get()

    set({ loading: true, error: null })

    if (areas.length === 0) {
      set({
        geoJson: null,
        geoJsonFiles: [],
        idMap: {},
        idToCommune: {},
        communes: [],
        geoStatisticalData: null,
        dataSource: null,
        dataKey: null,
        sourceName: null,
        loading: false,
      })
      return
    }

    await loadGeoJsonForAreas(areas, set)

    if (exampleDataEntry) {
      await loadExampleData(exampleDataEntry, set)
    } else if (dataSource === 'example') {
      set({
        geoStatisticalData: null,
        dataSource: null,
        dataKey: null,
        sourceName: null,
      })
    }

    if (token === refreshToken) {
      set({ loading: false })
    }
  },

  loadLocalCsv: async (filename, buffer) => {
    set({ loading: true, error: null })

    try {
      const dataset = parseCsvBuffer(buffer)

      set({
        geoStatisticalData: dataset,
        geoStatisticalDataColumn: 0,
        dataSource: 'local',
        dataKey: 'local',
        sourceName: filename,
        exampleDataEntry: null,
        loading: false,
      })
    } catch (error) {
      set({ error: errorMessage(error), loading: false })
    }
  },

  changeColumn: (column) => set({ geoStatisticalDataColumn: column }),

  openSpreadSheet: () => set({ showSpreadSheet: true }),

  closeSpreadSheet: (data) => {
    if (data === null) {
      set({ showSpreadSheet: false })
      return
    }

    set({
      showSpreadSheet: false,
      geoStatisticalData: data,
      geoStatisticalDataColumn: 0,
      dataSource: 'local',
      dataKey: 'local',
      sourceName: 'Edited data',
    })
  },

  openExampleSelector: () => set({ showExampleDataSelector: true }),
  closeExampleSelector: () => set({ showExampleDataSelector: false }),

  openDetailView: (communeId, communeName = null) =>
    set({
      detailViewTarget: communeId,
      detailViewTargetName: communeName,
    }),

  closeDetailView: () => set({ detailViewTarget: null, detailViewTargetName: null }),

  openTooltip: (communeId) => set({ tooltipTarget: communeId }),
  closeTooltip: () => set({ tooltipTarget: null }),

  clearError: () => set({ error: null }),
}))
