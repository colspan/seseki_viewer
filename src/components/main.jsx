import React from "react"
const T = React.PropTypes

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
    return <div>{t}, {m}. ({d}){"gewagewageawhgieohio"}</div>
  }
}

CommentBox.propTypes = {
    message: T.string.isRequired,
    date: T.instanceOf(Date).isRequired
}

export default CommentBox
