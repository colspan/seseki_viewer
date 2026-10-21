import type { Prefecture } from './types'

export interface HashState {
  areaIds: string[]
  examplePath: string | null
}

export function parseHash(hash: string): HashState {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const areaIds = (params.get('areas') ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  return {
    areaIds,
    examplePath: params.get('example') || null,
  }
}

export function buildHash(areas: Prefecture[], exampleFile?: string | null): string {
  const params = new URLSearchParams()

  if (areas.length > 0) {
    params.set(
      'areas',
      areas.map(area => area.id).join(','),
    )
    if (exampleFile) {
      params.set('example', exampleFile)
    }
  }

  const query = params.toString()
  return query ? `#${query}` : '#'
}

export function writeHash(hash: string): void {
  if (window.location.hash === hash) return

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${hash}`,
  )
}
