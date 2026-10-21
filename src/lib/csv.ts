import { csvParseRows } from 'd3-dsv'
import * as Encoding from 'encoding-japanese'

import type { CsvDataset, CsvRow } from './types'

export function decodeJapaneseCsv(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const converted = Encoding.convert(bytes, {
    from: 'AUTO',
    to: 'UNICODE',
    type: 'array',
  })

  return Encoding.codeToString(converted)
}

function uniqueColumnNames(header: string[]): string[] {
  const counts = new Map<string, number>()

  return header.map((name, index) => {
    const baseName = name || `Column ${index + 1}`
    const count = counts.get(baseName) ?? 0
    counts.set(baseName, count + 1)

    return count === 0 ? baseName : `${baseName} (${count + 1})`
  })
}

export function parseCsv(text: string): CsvDataset {
  const parsed = csvParseRows(text)
  if (parsed.length === 0) return { columns: [], rows: [] }

  const columns = uniqueColumnNames(parsed[0])
  const rows: CsvRow[] = parsed.slice(1).map((values) => {
    const row: CsvRow = {}

    columns.forEach((column, index) => {
      row[column] = values[index] ?? ''
    })

    return row
  })

  return { columns, rows }
}

export function parseCsvBuffer(buffer: ArrayBuffer): CsvDataset {
  return parseCsv(decodeJapaneseCsv(buffer))
}
