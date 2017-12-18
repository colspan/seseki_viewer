import React from "react"

import { Button, Icon, Modal } from "semantic-ui-react"
import HotTable from "react-handsontable"

export default class SpreadSheet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      spreadSheetData: null
    }
  }

  generateExample(withDummy) {
    const { communes } = this.props
    if (!communes) return null
    /* サンプルデータの自動挿入 */
    return Array.concat(
      [
        Array.concat(
          ["Title of data file", "Column 1", "Column 2", "Column 3"],
          new Array(30).fill(null)
        )
      ],
      communes.map((x, i) => {
        if (withDummy)
          return [x, i + 1, communes.length - i - 1, Math.random() * 200 - 100]
        else return [x, "", "", ""]
      }),
      new Array(30)
    )
  }

  render() {
    const { showSpreadSheet, geoStatisticalData, closeSpreadSheet } = this.props

    if (!showSpreadSheet) return null

    let spreadSheetData = []
    if (this.state.spreadSheetData) {
      spreadSheetData = this.state.spreadSheetData
    } else if (geoStatisticalData) {
      spreadSheetData = Array.concat(
        [geoStatisticalData.columns],
        geoStatisticalData.map((d) => {
          return geoStatisticalData.columns.map((x) => {
            return d[x]
          })
        })
      )
    } else {
      spreadSheetData = this.generateExample()
    }

    const hotTable = (
      <HotTable
        root="spreadsheet"
        data={spreadSheetData}
        colHeaders={true}
        rowHeaders={true}
        stretchH="all"
        width="100%"
        height="550"
        fixedColumnsLeft={1}
        fixedRowsTop={1}
      />
    )

    const updateData = () => {
      const rawData = hotTable.props.data
      /* d3.csvと同じ形式になるようにデータを再代入する */
      const newData = []
      const columns = rawData[0]
      rawData.slice(1, rawData.length).forEach((x) => {
        const row = {}
        columns.forEach((y, i) => {
          return (row[y] = x[i])
        })
        newData.push(row)
      })
      /* 列名がnullな列は無視する */
      newData.columns = []
      columns.forEach((x) => {
        if (x !== null) newData.columns.push(x)
      })
      this.setState({ spreadSheetData: null })
      closeSpreadSheet({ geoStatisticalData: newData })
    }
    const cancel = () => {
      this.setState({ spreadSheetData: null })
      closeSpreadSheet(null)
    }

    const updateByExample = () => {
      this.setState({ spreadSheetData: this.generateExample(true) })
    }

    // TODO heightをfunction化
    return (
      <Modal
        open={showSpreadSheet}
        closeOnDimmerClick
        onClose={updateData}
        size="fullscreen"
      >
        <Modal.Header>Spread Sheet Editor</Modal.Header>
        <Modal.Content>
          {hotTable}
        </Modal.Content>
        <Modal.Actions>
          <Button color="blue" onClick={updateByExample}>
            <Icon name="columns" /> Generate Example
          </Button>
          <Button color="red" onClick={cancel}>
            <Icon name="remove" /> Cancel
          </Button>
          <Button color="green" onClick={updateData}>
            <Icon name="checkmark" /> Update
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
