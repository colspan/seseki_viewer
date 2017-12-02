import React from "react"
import ReactDOM from "react-dom"
import { connect } from "react-redux"

import "semantic-ui-css/semantic.min.css"

import actions from "../actions"

import HeatMap from "../components/heatmap"
import AppHeader from "../components/appHeader"
import Ranking from "../components/ranking"
import DetailView from "../components/detailView"

import GeoStatisticalData from "../helpers/geoStatisticalData"

function mapStateToProps(state, ownProps) {
  const props = Object.assign({}, ownProps, state)
  return props
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detailViewTarget: null,
      detailViewTargetName: null
    }
  }
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

    const childProps = Object.assign({}, this.props.seseki, {
      geoStatData,
      dispatch: this.props.dispatch,
      openDetailView: (communeId, communeName) => {
        this.setState({
          detailViewTarget: communeId,
          detailViewTargetName: communeName
        })
      },
      closeDetailView: () => {
        this.setState({ detailViewTarget: null, detailViewTargetName: null })
      },
      detailViewTarget: this.state.detailViewTarget,
      detailViewTargetName: this.state.detailViewTargetName
    })

    const headerElem = <AppHeader {...childProps} />
    const mapElem = <HeatMap {...childProps} />
    const rankingElem = <Ranking {...childProps} />
    const detailView = this.state.detailViewTarget !== null
      ? <DetailView {...childProps} />
      : null

    return (
      <div id="container">
        {detailView}
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
