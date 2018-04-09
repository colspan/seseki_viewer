import { select, call, put, takeEvery } from "redux-saga/effects"
import actions from "./actions"
import * as d3 from "d3-request"
import { csvParse } from "d3-dsv"
import * as Encoding from "encoding-japanese"

import * as selectors from "./reducers/selectors"
import GeoJsonLoader from "./helpers/geoJsonLoader"

function *initialize(action) {
  yield put({ type: actions.LOCATION_CHANGE })
}

function *areaChange(action) {
  const newAreas = yield select(selectors.areas)
  const hashes = []
  if (newAreas && newAreas.length > 0)
    hashes.push(`areas=${newAreas.join(",")}`)
  location.hash = `#${hashes.join("&")}`
}

function *locationChange(action) {
  /* check update of areas */
  const geoJson = yield select(selectors.geoJson)
  const geoJsonFiles = yield select(selectors.geoJsonFiles)
  if (
    !geoJson ||
    (geoJson && geoJsonFiles && geoJson.length !== geoJsonFiles.length)
  ) {
    yield put({ type: actions.GEOJSON_FETCH_REQUEST })
  }
}

function *fetchGeoJsonFiles(action) {
  /* 一度消さないと react-leaflet が反応しない */
  yield put({ type: actions.GEOJSON_CLEAR })
  const areas = yield select(selectors.areas)
  try {
    const fetchedData = yield call(() => {
      const x = new GeoJsonLoader({
        geoJsonFiles: areas.map((x) => {
          return `data/${x.id}_${x.prefecture_en}_topo.json`
        })
      })
      return x.getLoader()
    })
    yield put({ type: actions.GEOJSON_FETCH_SUCCEEDED, data: fetchedData })
    yield put({ type: actions.GEOSTATISTICALDATA_FETCH_REQUEST })
  } catch (e) {
    yield put({ type: actions.GEOJSON_FETCH_FAILED, message: e.message })
  }
}

function *fetchGeoStatisticalDataRemote(action) {
  const geoStatisticalDataFiles = yield select(
    selectors.geoStatisticalDataFiles
  )
  try {
    const fetchedData = yield new Promise((resolve, reject) => {
      const filename = "sample_data/01_01_population_analysis.csv" // TODO
      d3
        .request(filename)
        .responseType("arraybuffer")
        .response((r) => {
          return new Uint8Array(r.response)
        })
        .get((error, d) => {
          if (error) {
            reject(error)
          } else {
            const data = Encoding.codeToString(
              Encoding.convert(d, { to: "UNICODE" })
            )
            resolve(csvParse(data))
          }
        })
    })
    yield put({
      type: actions.GEOSTATISTICALDATA_FETCH_SUCCEEDED,
      data: { geoStatisticalData: fetchedData }
    })
  } catch (e) {
    yield put({
      type: actions.GEOSTATISTICALDATA_FETCH_FAILED,
      message: e.message
    })
  }
}

function *fetchGeoStatisticalDataLocal(action) {
  const data = Encoding.codeToString(
    Encoding.convert(action.data.content, { to: "UNICODE" })
  )
  const fetchedData = csvParse(data)
  yield put({
    type: actions.GEOSTATISTICALDATA_FETCH_SUCCEEDED,
    data: { geoStatisticalData: fetchedData, filename: action.filename }
  })
}

function *rootSaga() {
  yield takeEvery(actions.INIT, initialize)
  yield takeEvery(actions.LOCATION_CHANGE, locationChange)
  yield takeEvery(actions.AREA_CHANGE, areaChange)
  yield takeEvery(actions.GEOJSON_FETCH_REQUEST, fetchGeoJsonFiles)
  yield takeEvery(
    actions.GEOSTATISTICALDATA_FETCH_REQUEST,
    fetchGeoStatisticalDataRemote
  )
  yield takeEvery(
    actions.GEOSTATISTICALDATA_LOCAL_CHANGED,
    fetchGeoStatisticalDataLocal
  )
}

export default rootSaga
