import React from "react"
import ReactDOM from "react-dom"
import { connect } from "react-redux"
import { parse } from "query-string"

import { Map, Polygon, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { geoCentroid } from "d3-geo"

import { Button, Dropdown, Header, Icon } from "semantic-ui-react"
import "semantic-ui-css/semantic.min.css"

import actions from "../actions"

import GeoStatisticalData from "../helpers/geoStatisticalData"

import HeatMap from "../components/heatmap"

import { prefectureDef } from "../helpers/params"

function mapStateToProps(state, ownProps) {
  const parsedHash = parse(location.hash)
  const props = Object.assign({}, ownProps, state, { hash: parsedHash })
  return props
}

class App extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: actions.INIT })
  }
  componentDidUpdate() {
  }
  render() {
    /* tile layer */
    const centroid = this.props.seseki.geoJson ? geoCentroid(this.props.seseki.geoJson) : [141.348541, 43.065617]
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const osmAttrib =
      '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    const tileLayerElem = (<TileLayer attribution={osmAttrib} url={osmUrl} opacity={0.2} />)

    /* heatmap layer */
    const heatmapAttrib = '&copy; <a href="http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html">国土数値情報 行政区域データ</a>, '
      + 'CC BY NC SA 4.0 <a href="https://github.com/colspan">Miyoshi(@colspan)</a> <a href="https://github.com/colspan/seseki_viewer">Seseki</a>'
    let featureStyle = {
      color: "#222",
      weight: 0.3,
      opacity: 0.6,
      fillOpacity: 0.6,
      fillColor: "#ffffff"
    }
    let eachFeature = (d, l) => {
      l.bindTooltip(d.name)
      l.on({
        mouseover: e => {
        },
        mouseout: e => {
        },
        click: e => {
        }
      })
    }
    /* データがあったらイベントを付与する */
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
            if (parent) parent.getLayers()
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
            if (parent) parent.getLayers()
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
    const heatMapElem = this.props.seseki.geoJson ? <HeatMap data={this.props.seseki.geoJson} style={featureStyle} onEachFeature={eachFeature} attribution={heatmapAttrib} /> : null

    const mapElem = (<Map center={[centroid[1], centroid[0]]} zoom={7} className="sesekimap" refs="map">
      {heatMapElem}
      {tileLayerElem}
    </Map>)

    const rankingElem = (<div id="ranking">ranking</div>)


    const prefectureOptions = prefectureDef.map(x => { return {key:x.id, value: x.id, text: x.prefecture_jp}})
    const headerElem = (
      <div id="header">
        <Header as='h2'>
          <Icon name='map outline' />
          <Header.Content>
            Seseki Viewer
            <Header.Subheader className="subtitle">
              Visualize Geo Statistical Data
            </Header.Subheader>
          </Header.Content>
        </Header>
        <div id="prefecture_selector">
          <Dropdown placeholder="Select Prefecture" multiple fluid selection options={prefectureOptions} />
        </div>
        <div id="toolbox">
          <Button content='Open CSV' icon='file excel outline' labelPosition='left' />
          <Button content='Edit' icon='edit' labelPosition='left' />
        </div>
        <div id="column-selector">
          <Dropdown placeholder="Select column" fluid selection options={[{ key: 'test', value: 'test', text: 'Test' }]} />
        </div>
      </div>
    )

    return (
      <div id="container">
        {headerElem}
        <div id="main">
          {mapElem}
          {rankingElem}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(App)
