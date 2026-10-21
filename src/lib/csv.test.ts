import { describe, expect, it } from 'vitest'

import { parseCsv, parseCsvBuffer } from './csv'

describe('parseCsv', () => {
  it('parses columns and rows', () => {
    const dataset = parseCsv('市町村,人口\n東京,100\n大阪,"1,234"\n')

    expect(dataset.columns).toEqual(['市町村', '人口'])
    expect(dataset.rows).toHaveLength(2)
    expect(dataset.rows[0]['市町村']).toBe('東京')
    expect(dataset.rows[1]['人口']).toBe('1,234')
  })

  it('decodes a UTF-8 buffer', () => {
    const buffer = new TextEncoder().encode(
      '市町村,人口\n東京,100\n',
    ).buffer as ArrayBuffer

    const dataset = parseCsvBuffer(buffer)

    expect(dataset.columns).toEqual(['市町村', '人口'])
    expect(dataset.rows[0]['市町村']).toBe('東京')
  })
})
