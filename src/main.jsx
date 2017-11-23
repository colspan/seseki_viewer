import React from "react"
import ReactDOM from "react-dom"
import { createStore, combineReducers, applyMiddleware } from "redux"
import { Provider } from "react-redux"
import createSagaMiddleware from "redux-saga"
import { syncHistoryWithStore, routerReducer } from "react-router-redux"
import { createBrowserHistory } from "history"

React.version

import { Router, Route, IndexRoute, Link, IndexLink } from "react-router-dom"

import App from "./containers"
import { sesekiReducer } from "./reducers"

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  combineReducers({ seseki: sesekiReducer, routing: routerReducer }),
  applyMiddleware(sagaMiddleware)
)

const history = syncHistoryWithStore(createBrowserHistory(), store)

class Main extends React.Component {
  render() {
    const { state, actions } = this.props
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={App} />
        </Router>
      </Provider>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById("app"))
