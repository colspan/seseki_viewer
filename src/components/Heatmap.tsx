import { geoCentroid } from 'd3-geo'
import type { Feature } from 'geojson'
import * as L from 'leaflet'
import { useCallback, useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'

import type GeoStatisticalData from '../lib/geoStatisticalData'
import type {
  CommuneFeature,
  CommuneFeatureCollection,
} from '../lib/types'
import { useSesekiStore } from '../store'
import { BoundaryData } from './BoundaryData'
import { Legend } from './Legend'

interface HeatmapProps {
  geoStatData: GeoStatisticalData | null
}

function MapViewController({
  geoJson,
}: {
  geoJson: CommuneFeatureCollection | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!geoJson) return

    const bounds = L.geoJSON(geoJson).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] })
    }
  }, [geoJson, map])

  return null
}

const BASE_STYLE: L.PathOptions = {
  color: '#222',
  weight: 0.3,
  opacity: 0.6,
  fillOpacity: 0.6,
  fillColor: '#ffffff',
}

const ACTIVE_STYLE: L.PathOptions = {
  weight: 5,
  fillColor: '#dce775',
  fillOpacity: 0.7,
}

export function Heatmap({ geoStatData }: HeatmapProps) {
  const geoJson = useSesekiStore(state => state.geoJson)
  const geoStatisticalDataColumn = useSesekiStore(
    state => state.geoStatisticalDataColumn,
  )
  const tooltipTarget = useSesekiStore(state => state.tooltipTarget)
  const openDetailView = useSesekiStore(state => state.openDetailView)

  const targetColumnName = geoStatData
    ? (geoStatData.csvKeys[geoStatisticalDataColumn + 1] ?? null)
    : null

  const targetColumn = useMemo(() => {
    if (!geoStatData || !targetColumnName) return null
    return geoStatData.getByColumnName(targetColumnName)
  }, [geoStatData, targetColumnName])

  const featureStyle = useCallback(
    (feature?: Feature): L.PathOptions => {
      if (!targetColumn || !feature) return BASE_STYLE

      const communeFeature = feature as CommuneFeature
      const value = targetColumn.parsedData[communeFeature.communeId]

      return {
        ...BASE_STYLE,
        fillColor:
          value == null ? BASE_STYLE.fillColor : targetColumn.colorScale(value),
      }
    },
    [targetColumn],
  )

  const centroid = useMemo<[number, number]>(() => {
    if (!geoJson) return [141.348541, 43.065617]

    const center = geoCentroid(geoJson)
    return [center[0], center[1]]
  }, [geoJson])

  const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <div className="map-panel">
      <MapContainer
        center={[centroid[1], centroid[0]]}
        zoom={8}
        className="sesekimap"
        zoomControl={false}
        zoomDelta={0.2}
        zoomSnap={0.2}
        attributionControl={false}
      >
        <TileLayer url={osmUrl} opacity={0.2} />
        {geoJson && (
          <BoundaryData
            data={geoJson}
            featureStyle={featureStyle}
            activeStyle={ACTIVE_STYLE}
            tooltipTarget={tooltipTarget}
            targetColumn={targetColumn}
            openDetailView={openDetailView}
          />
        )}
        <ZoomControl position="bottomright" />
        <MapViewController geoJson={geoJson} />
      </MapContainer>

      {geoStatData && targetColumnName && (
        <div className="map-caption">
          <h2>{geoStatData.csvKeys[0]}</h2>
          <h3>{targetColumnName}</h3>
        </div>
      )}

      {targetColumn && <Legend colorScale={targetColumn.colorScale} />}

      <div className="map-attribution">
        <a href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html">
          国土数値情報 行政区域データ
        </a>
        , CC BY NC SA 4.0{' '}
        <a href="https://github.com/colspan">Miyoshi(@colspan)</a>{' '}
        <a href="https://github.com/colspan/seseki_viewer">Seseki</a> |{' '}
        <a href="https://www.openstreetmap.org/copyright">
          OpenStreetMap contributors
        </a>
      </div>
    </div>
  )
}
