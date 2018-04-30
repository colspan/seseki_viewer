import React from 'react'
import { Button, Dropdown, Header, Icon } from 'semantic-ui-react'

import { prefectureDef } from '../helpers/params'

export default class AppHeader extends React.Component {
  render() {
    const prefectureOptions = prefectureDef.map(x => {
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
          <Header.Content>
            Seseki Viewer
            <Header.Subheader className="subtitle">
              for Geo Statistical Data
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
            value={this.props.areas.map(x => {
              return x.id
            })}
            onChange={this.props.changePrefecture}
          />
        </div>
        <div id="toolbox">
          <Button icon="file text outline" title="Examples" />
          <Button title="Open CSV" id="open_csv">
            <label htmlFor="file_input">
              <Icon name="folder open" />
              <input
                type="file"
                id="file_input"
                onChange={this.props.changeLocalFile}
              />
            </label>
          </Button>
          <Button
            title="Edit"
            icon="edit"
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
            onChange={this.props.changeGeoStatisticalDataColumn}
          />
        </div>
      </div>
    )
    return headerElem
  }
}
