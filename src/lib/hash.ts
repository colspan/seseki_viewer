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
  if (areas.length === 0) return '#'

  const parts = [`areas=${areas.map(area => area.id).join(',')}`]
  if (exampleFile) {
    parts.push(`example=${exampleFile}`)
  }

  return `#${parts.join('&')}`
}

export function writeHash(hash: string): void {
  if (window.location.hash === hash) return

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${hash}`,
  )
}
