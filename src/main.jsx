import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { createBrowserHistory } from 'history'

React.version

import { Router, Route } from 'react-router-dom'

import App from './containers'
import { sesekiReducer } from './reducers'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()
const logger = createLogger()
const store = createStore(
  combineReducers({ seseki: sesekiReducer, routing: routerReducer }),
  applyMiddleware(sagaMiddleware, logger)
)

const history = syncHistoryWithStore(createBrowserHistory(), store)

class Main extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history} hashType={'noslash'}>
          <Route path="/" component={App} />
        </Router>
      </Provider>
    )
  }
}

sagaMiddleware.run(rootSaga)
ReactDOM.render(<Main />, document.getElementById('app'))
