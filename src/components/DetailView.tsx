import { Modal, Table, Text } from '@mantine/core'

import type GeoStatisticalData from '../lib/geoStatisticalData'
import { useSesekiStore } from '../store'

interface DetailViewProps {
  geoStatData: GeoStatisticalData | null
}

export function DetailView({ geoStatData }: DetailViewProps) {
  const detailViewTarget = useSesekiStore(state => state.detailViewTarget)
  const detailViewTargetName = useSesekiStore(
    state => state.detailViewTargetName,
  )
  const geoStatisticalDataColumn = useSesekiStore(
    state => state.geoStatisticalDataColumn,
  )
  const idToCommune = useSesekiStore(state => state.idToCommune)
  const closeDetailView = useSesekiStore(state => state.closeDetailView)

  if (detailViewTarget === null) return null

  const communeName =
    detailViewTargetName ?? idToCommune[detailViewTarget] ?? 'Unknown'
  const data = geoStatData?.data[detailViewTarget]
  const columnNames = geoStatData?.csvKeys.slice(1, -1) ?? []

  return (
    <Modal
      opened
      onClose={closeDetailView}
      title={communeName}
      centered
      size="lg"
    >
      {data ? (
        <Table highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item Name</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Value</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {columnNames.map((columnName, index) => (
              <Table.Tr
                key={columnName}
                style={{
                  background:
                    geoStatisticalDataColumn === index
                      ? 'var(--mantine-color-orange-1)'
                      : undefined,
                }}
              >
                <Table.Td>{columnName}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {geoStatData?.format(data[columnName])}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text c="dimmed">No data available for this commune.</Text>
      )}
    </Modal>
  )
}
