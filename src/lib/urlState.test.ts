import { describe, expect, it } from 'vitest'

import { urlStateParsers } from './urlState'

describe('url state parsers', () => {
  it('parses comma-separated prefecture ids', () => {
    expect(urlStateParsers.areas.parse('01,13')).toEqual(['01', '13'])
  })

  it('serializes prefecture ids', () => {
    expect(urlStateParsers.areas.serialize?.(['01', '13'])).toBe('01,13')
  })

  it('parses example and column parameters', () => {
    expect(urlStateParsers.example.parse('examples/test.csv')).toBe('examples/test.csv')
    expect(urlStateParsers.column.parse('人口')).toBe('人口')
  })
})
