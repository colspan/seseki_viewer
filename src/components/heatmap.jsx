import * as L from 'leaflet'
import React from 'react'
import { Map, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { geoCentroid } from 'd3-geo'

import BoundaryData from './boundaryData'
import CaptionControl from './captionControl'

export default class Heatmap extends React.Component {
  render() {
    let captionControl = null
    /* heatmap layer */
    const heatmapAttrib =
      '&copy <a href="http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html">国土数値情報 行政区域データ</a>, ' +
      'CC BY NC SA 4.0 <a href="https://github.com/colspan">Miyoshi(@colspan)</a> <a href="https://github.com/colspan/seseki_viewer">Seseki</a>'
    let featureStyle = {
      color: '#222',
      weight: 0.3,
      opacity: 0.6,
      fillOpacity: 0.6,
      fillColor: '#ffffff'
    }
    const activeStyle = {
      weight: 5,
      fillColor: '#dce775',
      fillOpacity: 0.7
    }
    let eachFeature = (d, l) => {
      l.bindTooltip(d.name)
      l.on({
        mouseover: () => {},
        mouseout: () => {},
        click: () => {}
      })
    }
    /* データがあったらイベントを付与する */
    if (this.props.geoStatData) {
      /* データをバインドする */
      const { geoStatData } = this.props
      const targetColumnName =
        geoStatData.csvKeys[this.props.geoStatisticalDataColumn + 1]
      const targetColumnData = geoStatData.getByColumnName(targetColumnName)
      const idMap = this.props.idMap
      featureStyle = d => {
        return {
          color: '#222',
          weight: 0.3,
          opacity: 0.6,
          fillOpacity: 0.6,
          fillColor: targetColumnData.colorScale(
            targetColumnData.parsedData[idMap[d.name]]
          )
        }
      }
      eachFeature = (d, layer, parent) => {
        const communeId = d.communeId
        const commune_name = d.name
        const value = targetColumnData.format(
          targetColumnData.parsedData[idMap[d.name]]
        )
        /* 過去のイベントを消す */
        if (layer.__sesekiEvents) {
          layer.off(layer.__sesekiEvents)
        }
        layer.unbindPopup()

        /* binding tooltip */
        const tooltipElem = document.createElement('span')
        tooltipElem.innerHTML = `<span class="commune_name">${commune_name}</span><div class="value">${value}</div>`
        tooltipElem.addEventListener('click', e => {
          e.target.closeTooltip()
        })
        layer.bindTooltip(tooltipElem, { className: 'layer_tooltip' })
        let lastTarget = null /* Tooltipがゴミとして残るのを防ぐ */
        layer.__sesekiEvents = {
          mouseover: e => {
            /* 同じ市町村を同時に塗りかえる */
            if (parent)
              parent
                .getLayers()
                .filter(y => {
                  return y.feature.communeId === communeId
                })
                .forEach(y => {
                  y.setStyle(activeStyle)
                  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    y.bringToFront()
                  }
                })
            /* Tooltipがゴミとして残るのを防ぐ */
            lastTarget = e.target
          },
          mouseout: () => {
            /* 同じ市町村を同時に塗りかえる */
            if (parent)
              parent
                .getLayers()
                .filter(y => {
                  return y.feature.communeId === communeId
                })
                .forEach(y => {
                  y.setStyle(featureStyle(y.feature))
                })
          },
          click: () => {
            /* Tooltipがゴミとして残るのを防ぐ */
            if (lastTarget) lastTarget.closeTooltip()
            this.props.openDetailView(communeId)
          }
        }
        layer.on(layer.__sesekiEvents)
      }
      captionControl = (
        <CaptionControl
          title={this.props.geoStatData.csvKeys[0]}
          subtitle={targetColumnName}
        />
      )
    }
    const heatMapElem = this.props.geoJson ? (
      <BoundaryData
        data={this.props.geoJson}
        style={featureStyle}
        activeStyle={activeStyle}
        onEachFeature={eachFeature}
        attribution={heatmapAttrib}
        tooltipTarget={this.props.tooltipTarget}
      />
    ) : null

    /* tile layer */
    const centroid = this.props.geoJson
      ? geoCentroid(this.props.geoJson)
      : [141.348541, 43.065617]
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const osmAttrib =
      '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    const tileLayerElem = (
      <TileLayer attribution={osmAttrib} url={osmUrl} opacity={0.2} />
    )

    const mapElem = (
      <Map
        center={[centroid[1], centroid[0]]}
        zoom={8}
        className="sesekimap"
        refs="map"
        zoomControl={false}>
        {captionControl}
        {heatMapElem}
        {tileLayerElem}
        <ZoomControl position="bottomleft" />
      </Map>
    )

    return mapElem
  }
}
