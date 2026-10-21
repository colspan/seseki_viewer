import { describe, expect, it } from 'vitest'

import GeoStatisticalData from './geoStatisticalData'
import type { CsvDataset } from './types'

const dataset: CsvDataset = {
  columns: ['市町村', '人口', '面積'],
  rows: [
    { 市町村: '東京', 人口: '100', 面積: '10' },
    { 市町村: '大阪', 人口: '50', 面積: '20' },
    { 市町村: '北海道', 人口: '10', 面積: '30' },
  ],
}

const idMap = {
  東京: [1],
  大阪: [2],
  北海道: [3],
}

describe('GeoStatisticalData', () => {
  it('binds rows to commune ids', () => {
    const stats = new GeoStatisticalData(dataset, idMap, ['東京', '大阪', '北海道'])

    expect(stats.csvKeys).toEqual(['市町村', '人口', '面積'])
    expect(stats.data[1]['人口']).toBe('100')
    expect(stats.data[3]['面積']).toBe('30')
    expect(stats.dataArray).toHaveLength(3)
  })

  it('builds a normalized color scale', () => {
    const stats = new GeoStatisticalData(dataset, idMap, ['東京', '大阪', '北海道'])
    const column = stats.getByColumnName('人口')

    expect(column.parsedData[1]).toBe(100)
    expect(column.parsedData[2]).toBe(50)
    expect(column.domain).toEqual([0, 100])
    expect(column.normDomain).toEqual([0, 110])
    expect(column.format(100)).toBe('100')
    expect(column.format(12.34567)).toBe('12.3457')
  })

  it('parses comma-separated numbers', () => {
    const stats = new GeoStatisticalData(
      {
        columns: ['市町村', '人口'],
        rows: [{ 市町村: '東京', 人口: '1,234' }],
      },
      { 東京: [1] },
      ['東京'],
    )
    const column = stats.getByColumnName('人口')

    expect(column.parsedData[1]).toBe(1234)
  })

  it('rejects datasets with too few columns', () => {
    expect(
      () => new GeoStatisticalData({ columns: ['市町村'], rows: [] }, {}, []),
    ).toThrow('Too Few Columns')
  })
})
