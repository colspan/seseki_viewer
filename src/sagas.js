import { select, call, put, takeEvery } from "redux-saga/effects"
import actions from "./actions"
import * as selectors from "./reducers/selectors"

import GeoJsonLoader from "./helpers/geoJsonLoader"

function *initialize(action) {
  const areas = yield select(selectors.areas)
  if (!areas || areas.length == 0) {
    yield put({ type: "NO_AREA" })
  }
  const geoJson = yield select(selectors.geoJson)
  if (!geoJson) {
    yield put({ type: actions.GEOJSON_FETCH_REQUEST })
  }
}

function *fetchGeoJsonFiles(action) {
  const areas = yield select((x) => {
    return x.seseki.areas
  })
  try {
    const fetchedData = yield call(() => {
      const x = new GeoJsonLoader({
        geoJsonFiles: areas.map((x) => {
          return `data/${x}_topo.json`
        })
      })
      return x.getLoader()
    })
    yield put({ type: actions.GEOJSON_FETCH_SUCCEEDED, data: fetchedData })
  } catch (e) {
    yield put({ type: actions.GEOJSON_FETCH_FAILED, message: e.message })
  }
}

function *rootSaga() {
  yield takeEvery(actions.INIT, initialize)
  yield takeEvery(actions.GEOJSON_FETCH_REQUEST, fetchGeoJsonFiles)
}

export default rootSaga
