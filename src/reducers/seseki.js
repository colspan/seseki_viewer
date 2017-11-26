import { parse } from "query-string"

import actions from "../actions"
import { prefectureDef } from "../helpers/params"

const initialState = {
  areas: [],
  idMap: {},
  communes: {},
  geoJson: null,
  geoCsvFiles: []
}

export default function sesekiReducer(state = initialState, action) {
  const parsedHash = parse(location.hash)
  parsedHash.areas = parsedHash.areas.split(",")
  const validAreas = prefectureDef.filter((x) => {
    return parsedHash.areas.indexOf(x.id) != -1
  })

  const newState = Object.assign({}, state, { areas: validAreas })
  switch (action.type) {
    case actions.INIT:
      return newState
    case actions.GEOJSON_FETCH_REQUEST:
      return newState
    case actions.GEOJSON_FETCH_SUCCEEDED:
      newState.geoJson = action.data.geoJson
      newState.idMap = action.data.idMap
      newState.communes = action.data.communes
      return newState
    case actions.GEOJSON_FETCH_FAILED:
      return newState
    default:
      return newState
  }
}
