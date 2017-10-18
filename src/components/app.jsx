import React from "react"

import { Map, Polygon, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

export default class App extends React.Component {
  render() {
    const center = [43.065617, 141.348541]
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const osmAttrib =
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

    return (
      <div>
        <Map center={center} zoom={7} className="sesekimap">
          <TileLayer attribution={osmAttrib} url={osmUrl} opacity={0.2} />
        </Map>
      </div>
    )
  }
}
