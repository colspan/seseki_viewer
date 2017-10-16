import React from "react"
import ReactDOM from "react-dom"
import CommentBox from "./components/main.jsx"

React.version

ReactDOM.render(
  <CommentBox message="test test" date={new Date()} />,
  document.getElementById("app")
)
