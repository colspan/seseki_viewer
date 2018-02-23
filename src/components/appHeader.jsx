import React from "react"
import { Button, Dropdown, Header, Icon, Label } from "semantic-ui-react"

import actions from "../actions"
import { prefectureDef } from "../helpers/params"

export default class AppHeader extends React.Component {
  render() {
    const prefectureOptions = prefectureDef.map((x) => {
      return { key: x.id, value: x.id, text: x.prefecture_jp }
    })
    const columnOptions = this.props.geoStatData
      ? this.props.geoStatData.csvKeys.slice(1, -1).map((x, i) => {
        return { key: i, value: i, text: x }
      })
      : []

    const headerElem = (
      <div id="header">
        <Header as="h2">
          <Icon name="map outline" />
          <Header.Content>
            Seseki Viewer
            <Header.Subheader className="subtitle">
              Geo Statistical Data Visualizer
            </Header.Subheader>
          </Header.Content>
        </Header>
        <div id="prefecture_selector">
          <Dropdown
            placeholder="Select Prefecture"
            multiple
            fluid
            selection
            options={prefectureOptions}
            value={this.props.areas.map((x) => { return x.id })}
            onChange={(e, x) => {
              return this.props.dispatch({
                type: actions.AREA_CHANGE,
                data: { areas: x.value }
              })
            }}
          />
        </div>
        <div id="toolbox">
          <Button><label htmlFor="file_input"><Icon name="file excel outline" /> Open CSV
            <input type="file" id="file_input" onChange={(e, x) => {
              return this.props.dispatch({
                // TODO イベントを代入
                type: actions.GEOSTATISTICALDATA_LOCAL_CHANGED
              })
            }} /></label></Button>
          <Button
            content="Edit"
            icon="edit"
            labelPosition="left"
            onClick={this.props.openSpreadSheet}
          />
        </div>
        <div id="column-selector">
          <Dropdown
            placeholder="Select column"
            fluid
            selection
            options={columnOptions}
            value={this.props.geoStatisticalDataColumn}
            onChange={(e, x) => {
              return this.props.dispatch({
                type: actions.GEOSTATISTICALDATA_CHANGE_COLUMN,
                data: { column: x.value }
              })
            }}
          />
        </div>
      </div>
    )
    return headerElem
  }
}
