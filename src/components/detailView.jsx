import React from "react"
import { Button, Header, Icon, Modal, Table } from "semantic-ui-react"

export default class DetailView extends React.Component {
  render() {
    const {
      detailViewTarget,
      detailViewTargetName,
      closeDetailView,
      geoStatData,
      idToCommune
    } = this.props
    const data = geoStatData.data[detailViewTarget]
    const csvKeys = geoStatData.csvKeys.slice(1, -1)
    const format = geoStatData.format

    const bodyRows = csvKeys.map((k, i) => {
      return (
        <Table.Row key={i}>
          <Table.Cell>{k}</Table.Cell>
          <Table.Cell textAlign="right">{format(data[k])}</Table.Cell>
        </Table.Row>
      )
    })

    const detailTable = (
      <Table compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Item Name</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {bodyRows}
        </Table.Body>
      </Table>
    )

    const communeName = detailViewTargetName
      ? detailViewTargetName
      : idToCommune[detailViewTarget]

    return (
      <Modal
        open={detailViewTarget !== null}
        closeOnDimmerClick
        onClose={closeDetailView}
      >
        <Modal.Header>{communeName}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            {detailTable}
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={closeDetailView}>
            Close <Icon name="right chevron" />
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
