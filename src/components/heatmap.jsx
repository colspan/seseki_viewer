import { GeoJSON } from "react-leaflet"

export default class HeatMap extends GeoJSON {
  updateLeafletElement(fromProps, toProps) {
    const geoJsonLayer = this.leafletElement
    geoJsonLayer.getLayers().forEach(x => {
      geoJsonLayer.resetStyle(x);
      toProps.onEachFeature(x.feature, x, geoJsonLayer);
    })
    super.updateLeafletElement(fromProps, toProps)
  }
}
