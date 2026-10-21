import { Alert, Loader } from '@mantine/core'
import { lazy, Suspense, useEffect, useMemo } from 'react'

import { AppHeader } from './components/AppHeader'
import { DetailView } from './components/DetailView'
import { ExampleSelector } from './components/ExampleSelector'
import { Heatmap } from './components/Heatmap'
import { Ranking } from './components/Ranking'
import { useGeoStatData } from './hooks/useGeoStatData'
import { useUrlState } from './hooks/useUrlState'
import { useSesekiStore } from './store'

const SpreadSheet = lazy(() =>
  import('./components/SpreadSheet').then((module) => ({
    default: module.SpreadSheet,
  })),
)

export default function App() {
  const initialize = useSesekiStore((state) => state.initialize)
  const syncFromUrl = useSesekiStore((state) => state.syncFromUrl)
  const changeColumn = useSesekiStore((state) => state.changeColumn)
  const initialized = useSesekiStore((state) => state.initialized)
  const geoStatisticalDataColumn = useSesekiStore(
    (state) => state.geoStatisticalDataColumn,
  )
  const dataKey = useSesekiStore((state) => state.dataKey)
  const error = useSesekiStore((state) => state.error)
  const clearError = useSesekiStore((state) => state.clearError)
  const loading = useSesekiStore((state) => state.loading)
  const showSpreadSheet = useSesekiStore((state) => state.showSpreadSheet)
  const geoStatData = useGeoStatData()
  const { areas: areaIds, example, column, setUrlState } = useUrlState()

  const areaKey = areaIds.join(',')

  const columnIndex = useMemo(() => {
    if (!geoStatData || !column) return 0

    const index = geoStatData.csvKeys.slice(1, -1).indexOf(column)
    return index >= 0 ? index : 0
  }, [geoStatData, column])
  const dataMatchesUrl = example ? dataKey === example : dataKey === 'local'

  const columnIsInvalid = Boolean(
    dataMatchesUrl &&
    geoStatData &&
    column &&
    !geoStatData.csvKeys.slice(1, -1).includes(column),
  )
  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    if (!initialized) return

    void syncFromUrl(areaKey ? areaKey.split(',') : [], example)
  }, [initialized, areaKey, example, syncFromUrl])

  useEffect(() => {
    if (geoStatisticalDataColumn !== columnIndex) {
      changeColumn(columnIndex)
    }
  }, [columnIndex, geoStatisticalDataColumn, changeColumn])

  useEffect(() => {
    if (!columnIsInvalid) return

    void setUrlState({ column: null }, { history: 'replace' })
  }, [columnIsInvalid, setUrlState])

  return (
    <div className="app-shell">
      <AppHeader geoStatData={geoStatData} />

      {error && (
        <Alert
          color="red"
          title="Error"
          withCloseButton
          onClose={clearError}
          className="app-error"
        >
          {error}
        </Alert>
      )}

      <main className="app-main">
        <Heatmap geoStatData={geoStatData} />
        <Ranking geoStatData={geoStatData} />
      </main>

      <DetailView geoStatData={geoStatData} />
      {showSpreadSheet && (
        <Suspense
          fallback={
            <div className="app-loading">
              <Loader color="blue" />
            </div>
          }
        >
          <SpreadSheet />
        </Suspense>
      )}
      <ExampleSelector />

      {loading && (
        <div className="app-loading">
          <Loader color="blue" />
        </div>
      )}
    </div>
  )
}
