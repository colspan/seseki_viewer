import * as L from 'leaflet'
import { MapControl } from 'react-leaflet'

const caption = L.Control.extend({
  options: {
    position: 'topleft'
  },
  onAdd: function() {
    this.container = L.DomUtil.create('div', 'caption')
    this.render()
    return this.container
  },
  update: function(options) {
    this.options = Object.assign(this.options, options)
    this.render()
  },
  render: function() {
    const { title, subtitle } = this.options
    this.container.innerHTML = `<h2>${title}</h2><h3>${subtitle}</h3>`
  }
})

export default class CaptionControl extends MapControl {
  createLeafletElement(props) {
    this.caption = new caption(props)
    return this.caption
  }
  componentDidUpdate() {
    this.caption.update(this.props)
  }
}
