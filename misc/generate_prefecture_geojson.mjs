import { readFile, writeFile } from 'node:fs/promises'

import { merge } from 'topojson-client'

const root = new URL('../', import.meta.url)
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))

const japan = await readJson('data/japan_topo.json')
const japanObjectName = Object.keys(japan.objects)[0]
const prefectures = japan.objects[japanObjectName].geometries.map(
  (geometry) => geometry.properties,
)

const results = await Promise.all(
  prefectures.map(async (prefecture) => {
    const id = String(prefecture.id).padStart(2, '0')
    const topology = await readJson(`data/${id}_${prefecture.prefecture_en}_topo.json`)
    const objectName = Object.keys(topology.objects)[0]

    return {
      geometry: merge(topology, topology.objects[objectName].geometries),
      prefecture_jp: prefecture.prefecture_jp,
      prefecture_en: prefecture.prefecture_en,
      id: prefecture.id,
    }
  }),
)

const geodata = {
  type: 'FeatureCollection',
  features: results.map((result) => ({
    type: 'Feature',
    geometry: result.geometry,
    properties: {
      prefecture_jp: result.prefecture_jp,
      prefecture_en: result.prefecture_en,
      id: result.id,
    },
  })),
}

await writeFile(new URL('whole_japan_prefecture.json', root), JSON.stringify(geodata))

console.log(`Generated ${geodata.features.length} prefecture features.`)
