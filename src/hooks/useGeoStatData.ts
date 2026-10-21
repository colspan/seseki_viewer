import { useMemo } from 'react'

import GeoStatisticalData from '../lib/geoStatisticalData'
import { useSesekiStore } from '../store'

export function useGeoStatData(): GeoStatisticalData | null {
  const geoJson = useSesekiStore((state) => state.geoJson)
  const geoStatisticalData = useSesekiStore((state) => state.geoStatisticalData)
  const idMap = useSesekiStore((state) => state.idMap)
  const communes = useSesekiStore((state) => state.communes)

  return useMemo(() => {
    if (!geoJson || !geoStatisticalData) return null

    try {
      return new GeoStatisticalData(geoStatisticalData, idMap, communes)
    } catch (error) {
      console.warn('Unable to bind statistical data', error)
      return null
    }
  }, [geoJson, geoStatisticalData, idMap, communes])
}
