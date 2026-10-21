import '@mantine/core/styles.css'
import 'leaflet/dist/leaflet.css'
import './styles/app.css'

import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

const container = document.getElementById('app')

if (!container) {
  throw new Error('Missing #app element')
}

createRoot(container).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>,
)
