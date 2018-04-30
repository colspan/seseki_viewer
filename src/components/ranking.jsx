import React from 'react'
import { Table } from 'semantic-ui-react'

export default class Ranking extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      direction: 'descending'
    }
  }

  handleSort() {
    return () => {
      const { direction } = this.state
      this.setState({
        direction: direction === 'ascending' ? 'descending' : 'ascending'
      })
    }
  }
  getData() {
    const items = []
    if (this.props.geoStatData) {
      const geoStatisticalDataColumn = this.props.geoStatisticalDataColumn
      const { csvKeys, idMap } = this.props.geoStatData
      const targetColumn = this.props.geoStatData.getByColumnName(
        csvKeys[geoStatisticalDataColumn + 1]
      )
      if (targetColumn.dataArray) {
        targetColumn.dataArray.forEach((row, i) => {
          const communeName = row[csvKeys[0]]
          const communeIds = idMap[communeName]
          const value = targetColumn.getValue(row)
          const color = targetColumn.colorScale(value)
          if (communeIds)
            items.push({
              rank: i + 1,
              key: communeName,
              value: targetColumn.format(value),
              communeIds,
              color
            })
        })
      }
    }
    if (this.state.direction === 'ascending') items.reverse()
    return items
  }

  render() {
    const { direction } = this.state
    const items = this.getData()
    const bodyRows = items.map(x => {
      const communeId = x.communeIds[0]
      return (
        <Table.Row
          key={x.rank}
          style={{ background: x.color, cursor: 'pointer' }}
          onClick={() => {
            this.props.openDetailView(communeId, x.key)
          }}
          onMouseOver={() => {
            this.props.openTooltip(communeId)
          }}
          onMouseOut={() => {
            this.props.closeTooltip()
          }}>
          <Table.Cell>{x.rank}</Table.Cell>
          <Table.Cell>{x.key}</Table.Cell>
          <Table.Cell textAlign="right">{x.value}</Table.Cell>
        </Table.Row>
      )
    })

    const rankingTable = (
      <Table compact sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Rank</Table.HeaderCell>
            <Table.HeaderCell>Commune Name</Table.HeaderCell>
            <Table.HeaderCell sorted={direction} onClick={this.handleSort()}>
              Value
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{bodyRows}</Table.Body>
      </Table>
    )

    return <div id="ranking">{rankingTable}</div>
  }
}
