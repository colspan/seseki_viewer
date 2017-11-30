import React from "react"
import ReactDOM from "react-dom"
import { connect } from "react-redux"
import { parse } from "query-string"

import { Map, Polygon, Popup, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import actions from "../actions"

import GeoStatisticalData from "../helpers/geoStatisticalData"

function mapStateToProps(state, ownProps) {
  const parsedHash = parse(location.hash)
  const props = Object.assign({}, ownProps, state, { hash: parsedHash })
  return props
}

class HeatMap extends GeoJSON {
  updateLeafletElement(fromProps, toProps) {
    const geoJsonLayer = this.leafletElement
    geoJsonLayer.getLayers().forEach(x => {
      geoJsonLayer.resetStyle(x);
      toProps.onEachFeature(x.feature, x, geoJsonLayer);
    })
    super.updateLeafletElement(fromProps, toProps)
  }
}


class App extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.INIT })
  }
  componentDidUpdate() {
  }
  render() {
    const center = [43.065617, 141.348541]
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const osmAttrib =
      '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

    let featureStyle = {
      color: "#222",
      weight: 0.3,
      opacity: 0.6,
      fillOpacity: 0.6,
      fillColor: "#ffffff"
    }
    let eachFeature = (d, l) => { l.bindTooltip(d.name) }
    if (this.props.seseki.geoJson && this.props.seseki.geoStatisticalData) {
      /* データをバインドする */
      const geoStatData = new GeoStatisticalData(this.props.seseki.geoStatisticalData, this.props.seseki.idMap, this.props.seseki.communes)
      const targetColumn = geoStatData.getByColumnName(geoStatData.csvKeys[1])
      const idMap = this.props.seseki.idMap
      featureStyle = d => {
        return {
          color: "#222",
          weight: 0.3,
          opacity: 0.6,
          fillOpacity: 0.6,
          fillColor: targetColumn.colorScale(targetColumn.parsedData[idMap[d.name]])
        }
      }
      eachFeature = (d, layer, parent) => {
        const communeId = d.communeId
        const commune_name = d.name
        const value = targetColumn.format(targetColumn.parsedData[idMap[d.name]])
        /* binding tooltip */
        const tooltipElem = document.createElement("span")
        tooltipElem.innerHTML = `<span class="commune_name">${commune_name}</span><div class="value">${value}</div>`
        tooltipElem.addEventListener('click', x => {
          // click({ name: commune_name, communeId: communeId })
        })
        layer.bindTooltip(tooltipElem, { className: "layer_tooltip" })
        layer.on({
          mouseover: e => {
            const style = {
              weight: 5,
              fillColor: '#dce775',
              fillOpacity: 0.7
            }
            /* 同じ市町村を同時に塗りかえる */
            parent.getLayers()
              .filter(y => y.feature.communeId === communeId)
              .forEach(y => {
                y.setStyle(style)
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  y.bringToFront()
                }
              })
            e.target.openTooltip()
          },
          mouseout: e => {
            /* 同じ市町村を同時に塗りかえる */
            parent.getLayers()
              .filter(y => y.feature.communeId == communeId)
              .forEach(y => {
                parent.setStyle(featureStyle)
              })
            e.target.closeTooltip()
          },
          click: e => {
            // TODO
          }
        })
      }
    }

    const heatMapElem = this.props.seseki.geoJson ? <HeatMap data={this.props.seseki.geoJson} style={featureStyle} onEachFeature={eachFeature} /> : null
    return (
      <Map center={center} zoom={7} className="sesekimap" refs="map">
        {heatMapElem}
        <TileLayer attribution={osmAttrib} url={osmUrl} opacity={0.2} />
      </Map>
    )
  }
}

export default connect(mapStateToProps)(App)
