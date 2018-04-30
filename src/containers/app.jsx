import React from 'react'
import { connect } from 'react-redux'

import 'semantic-ui-css/semantic.min.css'

import actions from '../actions'

import HeatMap from '../components/heatmap'
import AppHeader from '../components/appHeader'
import Ranking from '../components/ranking'
import DetailView from '../components/detailView'
import SpreadSheet from '../components/spreadSheet'
import ExampleSelector from '../components/exampleSelector'

import GeoStatisticalData from '../helpers/geoStatisticalData'

function mapStateToProps(state, ownProps) {
  const props = Object.assign({}, ownProps, state)
  return props
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      detailViewTarget: null,
      detailViewTargetName: null,
      tooltipTarget: null
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.INIT })
  }
  render() {
    let geoStatData = null
    if (this.props.seseki.geoJson && this.props.seseki.geoStatisticalData) {
      /* データをバインドする MEMO reducerでやりきりたいが一旦ここで実装 */
      geoStatData = new GeoStatisticalData(
        this.props.seseki.geoStatisticalData,
        this.props.seseki.idMap,
        this.props.seseki.communes
      )
    }

    const childProps = Object.assign({}, this.props.seseki, {
      geoStatData,
      dispatch: this.props.dispatch,
      changePrefecture: (e, x) => {
        return this.props.dispatch({
          type: actions.AREA_CHANGE,
          data: { areas: x.value }
        })
      },
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
      detailViewTargetName: this.state.detailViewTargetName,
      openTooltip: communeId => {
        this.setState({ tooltipTarget: communeId })
      },
      closeTooltip: () => {
        this.setState({ tooltipTarget: null })
      },
      tooltipTarget: this.state.tooltipTarget,
      changeLocalFile: e => {
        if (e.target.files.length == 0) {
          // Cancelされた
          this.props.dispatch({
            type: actions.GEOSTATISTICALDATA_LOCALFETCH_REQUEST,
            data: { filename: null, content: null }
          })
        } else {
          const file = e.target.files[0]
          const reader = new FileReader()
          reader.onloadend = () => {
            this.props.dispatch({
              type: actions.GEOSTATISTICALDATA_LOCALFETCH_REQUEST,
              data: {
                filename: file.name,
                content: new Uint8Array(reader.result)
              }
            })
          }
          reader.readAsArrayBuffer(file)
        }
      },
      openSpreadSheet: () => {
        this.props.dispatch({ type: actions.SPREADSHEET_OPEN })
      },
      closeSpreadSheet: newData => {
        this.props.dispatch({ type: actions.SPREADSHEET_CLOSE, data: newData })
      },
      changeGeoStatisticalDataColumn: (e, x) => {
        return this.props.dispatch({
          type: actions.GEOSTATISTICALDATA_CHANGE_COLUMN,
          data: { column: x.value }
        })
      },
      exampleSelector: this.state.exampleSelector,
      openExampleSelector: () => {
        this.props.dispatch({
          type: actions.EXAMPLESELECTOR_OPEN
        })
      },
      closeExampleSelector: () => {
        this.props.dispatch({
          type: actions.EXAMPLESELECTOR_CLOSE
        })
      },
      selectExampleSelector: entry => {
        this.props.dispatch({
          type: actions.EXAMPLEDATA_FETCH_REQUEST,
          exampleDataEntry: entry
        })
      }
    })

    const headerElem = <AppHeader {...childProps} />
    const mapElem = <HeatMap {...childProps} />
    const rankingElem = <Ranking {...childProps} />
    const detailView =
      this.state.detailViewTarget !== null ? (
        <DetailView {...childProps} />
      ) : null
    const spreadSheet = <SpreadSheet {...childProps} />
    const examples = <ExampleSelector {...childProps} />

    return (
      <div id="container">
        {headerElem}
        <div id="main">
          {mapElem}
          {rankingElem}
        </div>
        {detailView}
        {spreadSheet}
        {examples}
      </div>
    )
  }
}

export default connect(mapStateToProps)(App)
