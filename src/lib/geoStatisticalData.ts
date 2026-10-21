import { max, min } from 'd3-array'
import { format as d3Format } from 'd3-format'
import { scaleLinear } from 'd3-scale'
import type { ScaleLinear } from 'd3-scale'

import type { CsvDataset, CsvRow } from './types'

export type ColorScale = ScaleLinear<string, string>

export interface ParsedColumn {
  parsedData: Record<number, number | null>
  dataArray: CsvRow[]
  columnName: string
  colorScale: ColorScale
  domain: number[]
  range: string[]
  normDomain: number[]
  format: (value: unknown) => string
  getValue: (row: CsvRow) => number | null
}

function normalizeDomain(domain: number[]): number[] {
  return domain.map(value => {
    if (value === 0) return 0

    const absolute = Math.abs(value)
    const digits = Math.floor(Math.log(absolute) / Math.log(10))
    const factor = Math.pow(10, digits - 1)
    const normalized = Math.floor(absolute / factor + 1) * factor

    return value > 0 ? normalized : -normalized
  })
}

export default class GeoStatisticalData {
  data: Record<number, CsvRow> = {}
  dataMultiIds: Record<string, CsvRow> = {}
  dataArray: CsvRow[] = []
  csvKeys: string[] = []
  idMap: Record<string, number[]>
  communes: string[]

  constructor(
    inputData: CsvDataset,
    idMap: Record<string, number[]>,
    communes: string[],
  ) {
    this.idMap = idMap
    this.communes = communes
    this.csvKeys = inputData.columns

    if (this.csvKeys.length < 2) {
      throw new Error('Too Few Columns')
    }

    inputData.rows.forEach(row => {
      const rawCommuneName = row[this.csvKeys[0]]
      if (rawCommuneName == null) return

      const communeName = String(rawCommuneName)
      if (communeName.length < 2) return

      const communeIds = this.idMap[communeName]
      if (!communeIds) return

      this.dataArray.push(row)
      communeIds.forEach(id => {
        this.data[id] = row
      })

      if (communeIds.length > 1) {
        this.dataMultiIds[communeName] = row
      }
    })
  }

  format(value: unknown): string {
    if (value == null || value === '') return ''

    const numericValue = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(numericValue)) return String(value)

    return d3Format(Number.isInteger(numericValue) ? ',.0f' : '0.4f')(numericValue)
  }

  getByColumnName(columnName: string): ParsedColumn {
    const getValue = (row: CsvRow): number | null => {
      const value = row[columnName]

      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null
      }

      if (typeof value !== 'string') return null

      const trimmed = value.trim()
      if (trimmed === '') return null

      if (/^(|-)([0-9]{1,3},)([0-9]{3},)*[0-9]{3}(|\.[0-9]+)$/.test(trimmed)) {
        return parseFloat(trimmed.replace(/,/g, ''))
      }

      if (/^(|-)[0-9]+(|\.[0-9]+)$/.test(trimmed)) {
        return parseFloat(trimmed)
      }

      return null
    }

    const sortedDataArray = [...this.dataArray].sort((a, b) => {
      const aValue = getValue(a)
      const bValue = getValue(b)

      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1

      return bValue - aValue
    })

    const values = sortedDataArray
      .map(getValue)
      .filter((value): value is number => value !== null)

    const maxValue = max(values) ?? 0
    const minValue = min(values) ?? 0
    const topValue = values[0] ?? 0
    const secondValue = values[1] ?? 0

    let domain: number[]
    let range: string[]

    if (minValue < 0 && maxValue < 0) {
      domain = [minValue, maxValue]
      range = ['white', '#ff5722']
    } else if (minValue < 0 && maxValue >= 0) {
      if (secondValue > 0 && topValue / secondValue > 3) {
        domain = [minValue, 0, secondValue, topValue]
        range = ['#03a9f4', 'white', '#ff5722', '#dd2c00']
      } else {
        domain = [minValue, 0, maxValue]
        range = ['#03a9f4', 'white', '#ff5722']
      }
    } else if (secondValue > 0 && topValue / secondValue > 3) {
      domain = [0, secondValue, topValue]
      range = ['white', '#ff5722', '#dd2c00']
    } else {
      domain = [0, maxValue]
      range = ['white', '#ff5722']
    }

    if (domain.length < 2 || domain[0] === domain[domain.length - 1]) {
      domain = [domain[0] ?? 0, (domain[0] ?? 0) + 1]
    }

    const normDomain = normalizeDomain(domain)
    const colorScale = scaleLinear<string>()
      .domain(normDomain)
      .range(range)

    const parsedData: Record<number, number | null> = {}
    Object.keys(this.data).forEach(id => {
      parsedData[Number(id)] = getValue(this.data[Number(id)])
    })

    return {
      parsedData,
      dataArray: sortedDataArray,
      columnName,
      colorScale,
      domain,
      range,
      normDomain,
      format: this.format.bind(this),
      getValue,
    }
  }

  clearData(): void {
    this.data = {}
    this.dataArray = []
    this.csvKeys = []
  }
}
