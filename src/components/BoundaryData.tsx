import type { Feature } from 'geojson'
import * as L from 'leaflet'
import { useEffect, useRef } from 'react'
import { GeoJSON } from 'react-leaflet'

import type { ParsedColumn } from '../lib/geoStatisticalData'
import type { CommuneFeature, CommuneFeatureCollection } from '../lib/types'

type CommuneLayer = L.Path & {
  feature?: CommuneFeature
  __sesekiEvents?: L.LeafletEventHandlerFnMap
}

interface BoundaryDataProps {
  data: CommuneFeatureCollection
  featureStyle: (feature?: Feature) => L.PathOptions
  activeStyle: L.PathOptions
  tooltipTarget: number | null
  targetColumn: ParsedColumn | null
  openDetailView: (communeId: number) => void
}

function createTooltipContent(feature: CommuneFeature, value: string): HTMLSpanElement {
  const container = document.createElement('span')
  const name = document.createElement('span')
  const valueElement = document.createElement('div')

  name.className = 'commune_name'
  name.textContent = feature.name
  valueElement.className = 'value'
  valueElement.textContent = value
  container.append(name, valueElement)

  return container
}

export function BoundaryData({
  data,
  featureStyle,
  activeStyle,
  tooltipTarget,
  targetColumn,
  openDetailView,
}: BoundaryDataProps) {
  const layerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    const geoLayer = layerRef.current
    if (!geoLayer) return

    const layers: CommuneLayer[] = []

    geoLayer.eachLayer((layer) => {
      const path = layer as CommuneLayer
      const feature = path.feature
      if (!feature) return

      layers.push(path)

      if (path.__sesekiEvents) {
        path.off(path.__sesekiEvents)
      }

      path.unbindTooltip()
      const value = targetColumn
        ? targetColumn.format(targetColumn.parsedData[feature.communeId])
        : ''
      path.bindTooltip(createTooltipContent(feature, value), {
        className: 'layer_tooltip',
      })

      const handlers: L.LeafletEventHandlerFnMap = {
        mouseover: () => {
          geoLayer.eachLayer((otherLayer) => {
            const otherPath = otherLayer as CommuneLayer
            if (otherPath.feature?.communeId === feature.communeId) {
              otherPath.setStyle(activeStyle)
              otherPath.bringToFront()
            }
          })
        },
        mouseout: () => {
          geoLayer.eachLayer((otherLayer) => {
            const otherPath = otherLayer as CommuneLayer
            if (otherPath.feature?.communeId === feature.communeId) {
              otherPath.setStyle(featureStyle(otherPath.feature))
            }
          })
        },
        click: () => {
          path.closeTooltip()
          openDetailView(feature.communeId)
        },
      }

      path.__sesekiEvents = handlers
      path.on(handlers)
    })

    return () => {
      layers.forEach((path) => {
        if (path.__sesekiEvents) {
          path.off(path.__sesekiEvents)
        }
        path.unbindTooltip()
      })
    }
  }, [data, targetColumn, featureStyle, activeStyle, openDetailView])

  useEffect(() => {
    const geoLayer = layerRef.current
    if (!geoLayer) return

    geoLayer.eachLayer((layer) => {
      const path = layer as CommuneLayer
      const feature = path.feature
      if (!feature) return

      if (tooltipTarget === feature.communeId) {
        path.setStyle(activeStyle)
        path.bringToFront()
        path.openTooltip()
      } else {
        path.setStyle(featureStyle(feature))
        path.closeTooltip()
      }
    })
  }, [tooltipTarget, featureStyle, activeStyle])

  return <GeoJSON ref={layerRef} data={data} style={featureStyle} />
}
