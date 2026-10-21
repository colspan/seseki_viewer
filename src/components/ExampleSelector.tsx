import { Modal, ScrollArea, Table } from '@mantine/core'

import { prefectureDef } from '../lib/params'
import { useSesekiStore } from '../store'

export function ExampleSelector() {
  const exampleDatasetDef = useSesekiStore((state) => state.exampleDatasetDef)
  const showExampleDataSelector = useSesekiStore((state) => state.showExampleDataSelector)
  const closeExampleSelector = useSesekiStore((state) => state.closeExampleSelector)
  const selectExample = useSesekiStore((state) => state.selectExample)

  if (!showExampleDataSelector) return null

  return (
    <Modal
      opened
      onClose={closeExampleSelector}
      title="Example Datasets"
      size="xl"
      centered
    >
      <ScrollArea.Autosize mah={560}>
        <Table highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Right Holder</Table.Th>
              <Table.Th>Prefectures</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {exampleDatasetDef.map((entry) => (
              <Table.Tr
                key={entry.file}
                style={{ cursor: 'pointer' }}
                onClick={() => void selectExample(entry)}
              >
                <Table.Td>{entry.title}</Table.Td>
                <Table.Td>{entry.right_holder}</Table.Td>
                <Table.Td>
                  {entry.target_prefectures
                    .map((target) =>
                      prefectureDef.find(
                        (prefecture) => Number(prefecture.id) === Number(target),
                      ),
                    )
                    .map((prefecture) => prefecture?.prefecture_jp ?? '')
                    .filter(Boolean)
                    .join(',')}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea.Autosize>
    </Modal>
  )
}
