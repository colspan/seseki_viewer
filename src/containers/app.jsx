import React from "react"
import ReactDOM from "react-dom"
import { connect } from "react-redux"

import "semantic-ui-css/semantic.min.css"

import actions from "../actions"

import HeatMap from "../components/heatmap"
import AppHeader from "../components/appHeader"
import Ranking from "../components/ranking"

import GeoStatisticalData from "../helpers/geoStatisticalData"

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

    const childProps = Object.assign({}, this.props.seseki, { geoStatData, dispatch: this.props.dispatch })

    const headerElem = (<AppHeader {...childProps} />)
    const mapElem = (<HeatMap {...childProps } />)
    const rankingElem = <Ranking {...childProps} />

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
