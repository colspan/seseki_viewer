import actions from "../actions"

const initialState = {
}

export default function sesekiReducer(state = initialState, action) {
  switch (action.type) {
    case actions.TEST:
      return state
    default:
      return state
  }
}
