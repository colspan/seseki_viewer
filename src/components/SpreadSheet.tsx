import { Button, Group, Modal } from '@mantine/core'
import {
  IconCheck,
  IconColumns,
  IconX,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { DataGrid } from 'react-data-grid'
import type { Column } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'

import type { CsvDataset, CsvRow } from '../lib/types'
import { useSesekiStore } from '../store'

type SpreadsheetRow = { id: string } & Record<string, string>

function uniqueColumns(columns: string[]): string[] {
  const seen = new Set<string>()

  return columns.map((column, index) => {
    const baseName = column || `Column ${index + 1}`
    let name = baseName
    let suffix = 2

    while (seen.has(name)) {
      name = `${baseName} (${suffix})`
      suffix += 1
    }

    seen.add(name)
    return name
  })
}

function datasetToRows(dataset: CsvDataset): {
  columns: string[]
  rows: SpreadsheetRow[]
} {
  const columns = uniqueColumns(dataset.columns)

  return {
    columns,
    rows: dataset.rows.map((row, index) => {
      const result: SpreadsheetRow = { id: String(index) }

      columns.forEach((column, columnIndex) => {
        result[column] = String(row[dataset.columns[columnIndex]] ?? '')
      })

      return result
    }),
  }
}

function createExample(
  communes: string[],
  withDummyValues: boolean,
): { columns: string[]; rows: SpreadsheetRow[] } {
  const columns = ['Title of data file', 'Column 1', 'Column 2', 'Column 3']

  return {
    columns,
    rows: communes.map((commune, index) => ({
      id: `${index}-${commune}`,
      'Title of data file': commune,
      'Column 1': withDummyValues ? String(index + 1) : '',
      'Column 2': withDummyValues ? String(communes.length - index - 1) : '',
      'Column 3': withDummyValues
        ? (Math.random() * 200 - 100).toFixed(2)
        : '',
    })),
  }
}

export function SpreadSheet() {
  const geoStatisticalData = useSesekiStore(
    state => state.geoStatisticalData,
  )
  const communes = useSesekiStore(state => state.communes)
  const closeSpreadSheet = useSesekiStore(state => state.closeSpreadSheet)

  const [gridData, setGridData] = useState(() =>
    geoStatisticalData
      ? datasetToRows(geoStatisticalData)
      : createExample(communes, false),
  )

  const { columns, rows } = gridData

  const gridColumns = useMemo<Column<SpreadsheetRow>[]>(
    () =>
      columns.map((column, index) => ({
        key: column,
        name: column,
        editable: true,
        resizable: true,
        width: index === 0 ? 220 : 140,
      })),
    [columns],
  )

  const updateData = () => {
    const dataset: CsvDataset = {
      columns,
      rows: rows.map(row => {
        const result: CsvRow = {}
        columns.forEach(column => {
          result[column] = row[column] ?? ''
        })
        return result
      }),
    }

    closeSpreadSheet(dataset)
  }

  const updateByExample = () => {
    setGridData(createExample(communes, true))
  }

  return (
    <Modal
      opened
      onClose={updateData}
      title="Spread Sheet Editor"
      fullScreen
    >
      <DataGrid
        className="spreadsheet-grid"
        columns={gridColumns}
        rows={rows}
        rowKeyGetter={row => row.id}
        onRowsChange={newRows =>
          setGridData(current => ({ ...current, rows: newRows }))
        }
        style={{ height: 'calc(100vh - 160px)' }}
      />

      <Group justify="flex-end" mt="md">
        <Button
          variant="light"
          leftSection={<IconColumns size={18} />}
          onClick={updateByExample}
        >
          Generate Example
        </Button>
        <Button
          color="red"
          variant="light"
          leftSection={<IconX size={18} />}
          onClick={() => closeSpreadSheet(null)}
        >
          Cancel
        </Button>
        <Button
          color="green"
          leftSection={<IconCheck size={18} />}
          onClick={updateData}
        >
          Update
        </Button>
      </Group>
    </Modal>
  )
}
