import { describe, expect, it } from 'vitest'

import { buildHash, parseHash } from './hash'
import { prefecturesFromIds } from './params'

describe('parseHash', () => {
  it('parses areas and an example dataset', () => {
    expect(parseHash('#areas=01,13&example=examples/test.csv')).toEqual({
      areaIds: ['01', '13'],
      examplePath: 'examples/test.csv',
    })
  })

  it('handles an empty hash', () => {
    expect(parseHash('#')).toEqual({
      areaIds: [],
      examplePath: null,
    })
  })
})

describe('buildHash', () => {
  it('builds a readable hash', () => {
    const areas = prefecturesFromIds(['01', '13'])
    expect(buildHash(areas, 'examples/test.csv')).toBe(
      '#areas=01,13&example=examples/test.csv',
    )
  })

  it('returns a bare hash when no area is selected', () => {
    expect(buildHash([])).toBe('#')
  })
})
