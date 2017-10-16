import React from "react"

class CommentBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: "Hello world!"
    }
  }

  render() {
    const t = this.state.text
    const m = this.props.message
    const d = this.props.date.toString()
    return <div>{t}, {m}. ({d}){"test"}</div>
  }
}

export default CommentBox
