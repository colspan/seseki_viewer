import {
  Button,
  FileButton,
  Group,
  MultiSelect,
  Select,
  Text,
  Title,
} from '@mantine/core'
import {
  IconEdit,
  IconFileText,
  IconFolderOpen,
} from '@tabler/icons-react'

import { prefectureDef } from '../lib/params'
import type GeoStatisticalData from '../lib/geoStatisticalData'
import { useSesekiStore } from '../store'

interface AppHeaderProps {
  geoStatData: GeoStatisticalData | null
}

export function AppHeader({ geoStatData }: AppHeaderProps) {
  const areas = useSesekiStore(state => state.areas)
  const geoStatisticalDataColumn = useSesekiStore(
    state => state.geoStatisticalDataColumn,
  )
  const setAreas = useSesekiStore(state => state.setAreas)
  const changeColumn = useSesekiStore(state => state.changeColumn)
  const loadLocalCsv = useSesekiStore(state => state.loadLocalCsv)
  const openExampleSelector = useSesekiStore(
    state => state.openExampleSelector,
  )
  const openSpreadSheet = useSesekiStore(state => state.openSpreadSheet)

  const prefectureOptions = prefectureDef.map(prefecture => ({
    value: prefecture.id,
    label: prefecture.prefecture_jp,
  }))

  const columnOptions = geoStatData
    ? geoStatData.csvKeys.slice(1, -1).map((key, index) => ({
        value: String(index),
        label: key,
      }))
    : []

  const handleFile = async (file: File | null) => {
    if (!file) return

    const buffer = await file.arrayBuffer()
    await loadLocalCsv(file.name, buffer)
  }

  return (
    <header className="app-header">
      <div className="app-title">
        <Title order={2} size="h3" c="white">
          Seseki Viewer
        </Title>
        <Text size="xs" c="blue.1">
          for Geo Statistical Data
        </Text>
      </div>

      <MultiSelect
        className="prefecture-select"
        placeholder="Select Prefecture"
        data={prefectureOptions}
        value={areas.map(area => area.id)}
        onChange={ids => void setAreas(ids)}
        searchable
        clearable
        hidePickedOptions
        aria-label="Select prefectures"
      />

      <Group gap="xs" wrap="nowrap" className="toolbox">
        <Button
          variant="light"
          color="white"
          leftSection={<IconFileText size={18} />}
          onClick={openExampleSelector}
          title="Examples"
        >
          Examples
        </Button>

        <FileButton
          accept=".csv,text/csv"
          onChange={file => void handleFile(file)}
        >
          {props => (
            <Button
              {...props}
              variant="light"
              color="white"
              leftSection={<IconFolderOpen size={18} />}
            >
              Open CSV
            </Button>
          )}
        </FileButton>

        <Button
          variant="light"
          color="white"
          leftSection={<IconEdit size={18} />}
          onClick={openSpreadSheet}
        >
          Edit
        </Button>
      </Group>

      <Select
        className="column-select"
        placeholder="Select column"
        data={columnOptions}
        value={
          columnOptions.length > 0
            ? String(geoStatisticalDataColumn)
            : null
        }
        onChange={value => {
          if (value !== null) changeColumn(Number(value))
        }}
        searchable
        disabled={columnOptions.length === 0}
        aria-label="Select data column"
      />
    </header>
  )
}
