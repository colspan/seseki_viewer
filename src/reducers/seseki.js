import { parse } from 'query-string'

import actions from '../actions'
import { prefectureDef } from '../helpers/params'

const initialState = {
  areas: [],
  idMap: {},
  idToCommune: {},
  communes: {},
  geoJson: null,
  geoJsonFiles: [],
  sampleDataDef: [],
  exampleDataEntry: null,
  geoStatisticalData: null,
  geoStatisticalDataColumn: null
}

function parseHash() {
  const parsedHash = parse(location.hash)
  let areas = []
  if (parsedHash.areas) {
    const hashAreas = parsedHash.areas.split(',')
    areas = prefectureDef.filter(x => {
      return hashAreas.indexOf(x.id) !== -1
    })
  }
  let exampleDataPath = parsedHash.example
  return {
    areas,
    exampleDataPath
  }
}

export default function sesekiReducer(state = initialState, action) {
  const parsedHash = parseHash()
  const newState = Object.assign({}, state)
  switch (action.type) {
    case actions.INIT:
    case actions.LOCATION_CHANGE:
      /* 表示都道府県 */
      newState.areas = parsedHash.areas
      /* サンプルデータ */
      if (parsedHash.exampleDataPath)
        newState.exampleDataPath = state.sampleDataDef.find(
          d => d['file'] === parsedHash.exampleDataPath
        )
      break
    case actions.AREA_CHANGE:
      newState.areas = prefectureDef.filter(x => {
        return action.data.areas.indexOf(x.id) !== -1
      })
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
      newState.idToCommune = action.data.idToCommune
      newState.communes = action.data.communes
      newState.geoJson = action.data.geoJson
      newState.geoJsonFiles = action.data.options.geoJsonFiles
      break
    case actions.GEOJSON_FETCH_FAILED:
      break
    case actions.GEOSTATISTICALDATA_FETCH_SUCCEEDED:
      newState.geoStatisticalData = action.data.geoStatisticalData
      newState.geoStatisticalDataColumn = 0 // TODO 長さをチェックする。外から与えられるようにする。
      break
    case actions.GEOSTATISTICALDATA_CHANGE_COLUMN:
      newState.geoStatisticalDataColumn = action.data.column
      break
    case actions.SPREADSHEET_OPEN:
      newState.showSpreadSheet = true
      break
    case actions.SPREADSHEET_CLOSE:
      newState.showSpreadSheet = false
      if (action.data === null) break
      newState.geoStatisticalData = action.data.geoStatisticalData
      break
    case actions.SAMPLEDATADEF_FETCH_SUCCEEDED:
      newState.sampleDataDef = action.sampleDataDef
      break
    case actions.EXAMPLEDATA_FETCH_REQUEST:
      newState.exampleDataEntry = action.exampleDataEntry
      break
    default:
      break
  }
  return newState
}
