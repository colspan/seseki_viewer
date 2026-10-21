import { Table, Text } from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import type GeoStatisticalData from '../lib/geoStatisticalData'
import { useSesekiStore } from '../store'

interface RankingProps {
  geoStatData: GeoStatisticalData | null
}

type SortDirection = 'ascending' | 'descending'

export function Ranking({ geoStatData }: RankingProps) {
  const [direction, setDirection] = useState<SortDirection>('descending')
  const idMap = useSesekiStore((state) => state.idMap)
  const geoStatisticalDataColumn = useSesekiStore(
    (state) => state.geoStatisticalDataColumn,
  )
  const openDetailView = useSesekiStore((state) => state.openDetailView)
  const openTooltip = useSesekiStore((state) => state.openTooltip)
  const closeTooltip = useSesekiStore((state) => state.closeTooltip)

  const items = useMemo(() => {
    if (!geoStatData) return []

    const columnName = geoStatData.csvKeys[geoStatisticalDataColumn + 1]
    if (!columnName) return []

    const targetColumn = geoStatData.getByColumnName(columnName)
    const result = targetColumn.dataArray.flatMap((row, index) => {
      const communeName = String(row[geoStatData.csvKeys[0]] ?? '')
      const communeIds = idMap[communeName]
      if (!communeIds) return []

      const value = targetColumn.getValue(row)

      return [
        {
          rank: index + 1,
          communeName,
          communeId: communeIds[0],
          value: targetColumn.format(value),
          color: value == null ? '#ffffff' : targetColumn.colorScale(value),
        },
      ]
    })

    return direction === 'ascending' ? [...result].reverse() : result
  }, [geoStatData, geoStatisticalDataColumn, idMap, direction])

  const toggleDirection = () => {
    setDirection((current) => (current === 'ascending' ? 'descending' : 'ascending'))
  }

  return (
    <aside className="ranking-panel">
      <Table stickyHeader highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Rank</Table.Th>
            <Table.Th>Commune Name</Table.Th>
            <Table.Th
              onClick={toggleDirection}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Value{' '}
              {direction === 'descending' ? (
                <IconChevronDown size={14} />
              ) : (
                <IconChevronUp size={14} />
              )}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr
              key={`${item.rank}-${item.communeName}`}
              style={{ background: item.color, cursor: 'pointer' }}
              onClick={() => openDetailView(item.communeId, item.communeName)}
              onMouseOver={() => openTooltip(item.communeId)}
              onMouseOut={closeTooltip}
            >
              <Table.Td>{item.rank}</Table.Td>
              <Table.Td>{item.communeName}</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{item.value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {items.length === 0 && (
        <Text c="dimmed" ta="center" p="md">
          No ranking data
        </Text>
      )}
    </aside>
  )
}
