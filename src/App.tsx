import { Alert, Loader } from '@mantine/core'
import { lazy, Suspense, useEffect } from 'react'

import { AppHeader } from './components/AppHeader'
import { DetailView } from './components/DetailView'
import { ExampleSelector } from './components/ExampleSelector'
import { Heatmap } from './components/Heatmap'
import { Ranking } from './components/Ranking'
import { useGeoStatData } from './hooks/useGeoStatData'
import { useSesekiStore } from './store'

const SpreadSheet = lazy(() =>
  import('./components/SpreadSheet').then((module) => ({
    default: module.SpreadSheet,
  })),
)

export default function App() {
  const initialize = useSesekiStore((state) => state.initialize)
  const syncFromHash = useSesekiStore((state) => state.syncFromHash)
  const error = useSesekiStore((state) => state.error)
  const clearError = useSesekiStore((state) => state.clearError)
  const loading = useSesekiStore((state) => state.loading)
  const showSpreadSheet = useSesekiStore((state) => state.showSpreadSheet)
  const geoStatData = useGeoStatData()

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    const handleHashChange = () => {
      void syncFromHash()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [syncFromHash])

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
