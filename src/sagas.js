import { select, call, put, takeEvery } from "redux-saga/effects"
import actions from "./actions"
import * as selectors from "./reducers/selectors"

import GeoJsonLoader from "./helpers/geoJsonLoader"

function* initialize(action) {
  const areas = yield select(selectors.areas)
  if (!areas || areas.length == 0) {
    yield put({ type: actions.SHOW_AREA_SELECTOR })
  }
  yield put({ type: actions.LOCATION_CHANGE })
}

function* locationChange(action) {
  /* check update of areas */
  const geoJson = yield select(selectors.geoJson)
  const geoJsonFiles = yield select(selectors.geoJsonFiles)
  if (!geoJson || geoJson && geoJsonFiles && geoJson.length != geoJsonFiles.length) {
    yield put({ type: actions.GEOJSON_FETCH_REQUEST })
  }
}

function* fetchGeoJsonFiles(action) {
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
  } catch (e) {
    yield put({ type: actions.GEOJSON_FETCH_FAILED, message: e.message })
  }
}

function* rootSaga() {
  yield takeEvery(actions.INIT, initialize)
  yield takeEvery(actions.LOCATION_CHANGE, locationChange)
  yield takeEvery(actions.GEOJSON_FETCH_REQUEST, fetchGeoJsonFiles)
}

export default rootSaga
