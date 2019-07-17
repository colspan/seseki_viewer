import * as L from 'leaflet'
import { MapControl } from 'react-leaflet'

import { select as d3Select, format as d3Format } from 'd3'
import * as d3Legend from 'd3-svg-legend'

const legend = L.Control.extend({
  options: {
    position: 'bottomleft',
    colorScale: null
  },
  onAdd: function() {
    this.container = L.DomUtil.create('div', 'legend')
    this.legendContainer = d3Select(this.container)
      .append('svg')
      .attr('class', 'legendQuant')
      .attr('preserveAspectRatio', 'xMinYMax meet')
    // 初回描画のための遅延描画。onAddによる描画終了のイベントを得られないので1秒後の呼び出しで代替する
    setTimeout(() => this.render(), 1000)
    return this.container
  },
  update: function(options) {
    this.options = Object.assign(this.options, options)
    this.render()
  },
  render: function() {
    const { formatStr, colorScale } = this.options
    const { legendContainer } = this
    if (!colorScale) return null
    const domain = colorScale.domain()
    const formatter = d3Format(
      domain
        ? domain[0] % 1 === 0 && domain[1] % 1 === 0
          ? ',.0f'
          : '0.2f'
        : ',.0f'
    )
    const legend = d3Legend
      .legendColor()
      .cells(11)
      .shapeWidth(50)
      .labelFormat(formatter)
      .scale(colorScale)
    legendContainer.call(legend)
  }
})

export default class LegendControl extends MapControl {
  createLeafletElement(props) {
    this.legend = new legend(props)
    return this.legend
  }
  componentDidUpdate() {
    this.legend.update(this.props)
  }
}
