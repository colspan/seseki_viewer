import React from "react"
import ReactDOM from "react-dom"
import { connect } from "react-redux"
import { parse } from "query-string"

import { Button, Dropdown, Header, Icon } from "semantic-ui-react"
import "semantic-ui-css/semantic.min.css"

import actions from "../actions"

import HeatMap from "../components/heatmap"

import GeoStatisticalData from "../helpers/geoStatisticalData"
import { prefectureDef } from "../helpers/params"

function mapStateToProps(state, ownProps) {
  const props = Object.assign({}, ownProps, state)
  return props
}

class App extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: actions.INIT })
  }
  render() {

    let geoStatData = null
    if (this.props.seseki.geoJson && this.props.seseki.geoStatisticalData) {
      /* データをバインドする */
      geoStatData = new GeoStatisticalData(
        this.props.seseki.geoStatisticalData,
        this.props.seseki.idMap,
        this.props.seseki.communes
      )
    }

    const mapElem = (<HeatMap {...Object.assign({}, this.props.seseki, { geoStatData }) } />)

    const rankingElem = <div id="ranking">ranking</div>

    const prefectureOptions = prefectureDef.map(x => {
      return { key: x.id, value: x.id, text: x.prefecture_jp }
    })
    const columnOptions = geoStatData
      ? geoStatData.csvKeys.slice(1, -1).map((x, i) => {
        return { key: i, value: i, text: x }
      })
      : []
    const headerElem = (
      <div id="header">
        <Header as="h2">
          <Icon name="map outline" />
          <Header.Content>
            Seseki Viewer
            <Header.Subheader className="subtitle">Visualize Geo Statistical Data</Header.Subheader>
          </Header.Content>
        </Header>
        <div id="prefecture_selector">
          <Dropdown
            placeholder="Select Prefecture"
            multiple
            fluid
            selection
            options={prefectureOptions}
            value={this.props.seseki.areas.map(x => x.id)}
            onChange={(e, x) => this.props.dispatch({ type: actions.AREA_CHANGE, data: { areas: x.value } })}
          />
        </div>
        <div id="toolbox">
          <Button content="Open CSV" icon="file excel outline" labelPosition="left" />
          <Button content="Edit" icon="edit" labelPosition="left" />
        </div>
        <div id="column-selector">
          <Dropdown
            placeholder="Select column"
            fluid
            selection
            options={columnOptions}
            value={this.props.seseki.geoStatisticalDataColumn}
            onChange={(e, x) => this.props.dispatch({ type: actions.GEOSTATISTICALDATA_CHANGE_COLUMN, data: { column: x.value } })}
          />
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
