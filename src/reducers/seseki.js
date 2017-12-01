import { parse } from "query-string"

import actions from "../actions"
import { prefectureDef } from "../helpers/params"

const initialState = {
  areas: [],
  idMap: {},
  communes: {},
  geoJson: null,
  geoJsonFiles: [],
  geoStatisticalData: null,
  geoStatisticalDataFiles: [],
  geoStatisticalDataColumn: null
}

function parseHash() {
  const parsedHash = parse(location.hash)
  let areas = []
  if (parsedHash.areas) {
    const hashAreas = parsedHash.areas.split(",")
    areas = prefectureDef.filter(x => {
      return hashAreas.indexOf(x.id) != -1
    })
  }
  return {
    areas
  }
}

export default function sesekiReducer(state = initialState, action) {
  const parsedHash = parseHash()
  const newState = Object.assign({}, state)
  switch (action.type) {
    case actions.INIT:
    case actions.LOCATION_CHANGE:
      if (parsedHash.areas) newState.areas = parsedHash.areas
      break
    case actions.AREA_CHANGE:
      newState.areas = action.data.areas
      break
    case actions.GEOJSON_CLEAR:
      newState.idMap = []
      newState.geoJson = null
      newState.geoJsonFiles = null
      break
    case actions.GEOJSON_FETCH_REQUEST:
      break
    case actions.GEOJSON_FETCH_SUCCEEDED:
      newState.idMap = action.data.idMap
      newState.communes = action.data.communes
      newState.geoJson = action.data.geoJson
      newState.geoJsonFiles = action.data.options.geoJsonFiles
      break
    case actions.GEOJSON_FETCH_FAILED:
      break
    case actions.GEOSTATISTICALDATA_FETCH_SUCCEEDED:
      newState.geoStatisticalData = action.data.geoStatisticalData
      newState.geoStatisticalDataFiles = ["TODO"] // TODO
      newState.geoStatisticalDataColumn = 0 // TODO 長さをチェックする。外から与えられるようにする。
      break
    case actions.GEOSTATISTICALDATA_CHANGE_COLUMN:
      newState.geoStatisticalDataColumn = action.data.column
      break
    default:
      break
  }
  return newState
}
