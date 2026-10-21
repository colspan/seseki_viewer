import { csvParse } from 'd3-dsv'
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

export function parseCsv(text: string): CsvDataset {
  const parsed = csvParse(text)
  const columns = parsed.columns ?? []
  const rows: CsvRow[] = parsed.map((row) => ({ ...row }))

  return { columns, rows }
}

export function parseCsvBuffer(buffer: ArrayBuffer): CsvDataset {
  return parseCsv(decodeJapaneseCsv(buffer))
}
