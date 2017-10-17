import { connect } from "react-redux"

import App from "../components"

function mapStateToProps(state) {
  return state
}

const connectedApp = connect(mapStateToProps)(App)
export default connectedApp
