import React from "react"
import { connect } from "react-redux"
import { parse } from "query-string"

import { Map, Polygon, Popup, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import actions from "../actions"

function mapStateToProps(state, ownProps) {
  const parsedHash = parse(location.hash)
  const props = Object.assign({}, ownProps, state, { hash: parsedHash })
  return props
}

class App extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: actions.INIT })
  }
  componentWillUpdate(nextProps) {}
  render() {
    const center = [43.065617, 141.348541]
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const osmAttrib =
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

    let geoJsonElem = null
    if (this.props.seseki.geoJson != null) {
      geoJsonElem = <GeoJSON data={this.props.seseki.geoJson} />
    }

    return (
      <Map center={center} zoom={7} className="sesekimap">
        {geoJsonElem}
        <TileLayer attribution={osmAttrib} url={osmUrl} opacity={0.2} />
      </Map>
    )
  }
}

export default connect(mapStateToProps)(App)
