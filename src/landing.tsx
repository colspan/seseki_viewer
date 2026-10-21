import './styles/landing.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Landing from './LandingPage'

const container = document.getElementById('app')

if (!container) {
  throw new Error('Missing #app element')
}

createRoot(container).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
