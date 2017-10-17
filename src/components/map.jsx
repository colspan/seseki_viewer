import React from "react"
import ReactDOM from "react-dom"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return <div className="sesekimap" />
  }

  componentDidMount() {
    const leafletObj = L.map(ReactDOM.findDOMNode(this), {
      zoom: 7,
      minZoom: 4,
      maxZoom: 18,
      center: [43.065617, 141.348541]
    })
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const osmAttrib =
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    const osmOption = { attribution: osmAttrib, opacity: 0.2 }
    L.tileLayer(osmUrl, osmOption).addTo(leafletObj)
  }
}

export default Map
