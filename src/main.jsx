import React from "react"
import ReactDOM from "react-dom"
import { createStore } from "redux"
import { Provider } from "react-redux"

import App from "./container"
import { sesekiReducer } from "./reducers"

React.version

const store = createStore(sesekiReducer)
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
)
