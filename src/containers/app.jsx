import React from "react"
import { connect } from "react-redux"

import { Map, Polygon, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function mapStateToProps(state, ownProps) {
  console.log(state, ownProps)
  return { state }
}

class App extends React.Component {
  render() {
    const center = [43.065617, 141.348541]
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const osmAttrib =
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

    return (
      <Map center={center} zoom={7} className="sesekimap">
        <TileLayer attribution={osmAttrib} url={osmUrl} opacity={0.2} />
      </Map>
    )
  }
}

export default connect(mapStateToProps)(App)
