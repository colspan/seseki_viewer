import * as L from 'leaflet'
import { GeoJSON } from 'react-leaflet'
import { isEqual } from 'lodash'

export default class BoundaryData extends GeoJSON {
  constructor(props) {
    super(props)
    this.state = {
      tooltipTarget: null
    }
    this.tooltips = [] // state使う実装にそのうち治す TODO
  }
  updateLeafletElement(currentProps, nextProps) {
    super.updateLeafletElement(currentProps, nextProps)

    /* eventを付与 */
    if (!isEqual(currentProps.onEachFeature, nextProps.onEachFeature)) {
      const geoJsonLayer = this.leafletElement
      geoJsonLayer.getLayers().forEach(x => {
        // geoJsonLayer.resetStyle(x) // どこかで強制的にリセットされるので不要
        nextProps.onEachFeature(x.feature, x, geoJsonLayer)
      })
    }

    this.tooltips.forEach(x => {
      x._close()
    })
    /* ranking等からのmouseoverで色を塗る */
    const geoJsonLayer = this.leafletElement
    if (geoJsonLayer) {
      if (this.props.tooltipTarget) {
        geoJsonLayer
          .getLayers()
          .filter(y => {
            return y.feature.communeId === this.props.tooltipTarget
          })
          .forEach(y => {
            y.setStyle(this.props.activeStyle)
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              y.bringToFront()
            }
          })
        const targetLayer = geoJsonLayer.getLayers().find(y => {
          return y.feature.communeId === this.props.tooltipTarget
        })
        if (targetLayer) {
          targetLayer.openTooltip()
          this.tooltips.push(targetLayer.getTooltip())
        }
      }

      // どこかで強制的にリセットされるので塗り直しは不要
    }
  }
}
