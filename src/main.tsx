import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedDemoData } from '@/db/seedDemoData'

declare global {
  interface Window {
    seedDemoData?: typeof seedDemoData
  }
}

if (import.meta.env.DEV) {
  window.seedDemoData = seedDemoData
}

async function maybeSeedFromUrl() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('seed') !== 'demo') return

  const result = await seedDemoData({ weeks: 3, replace: true })
  params.delete('seed')
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
  window.history.replaceState({}, '', next)
  console.info('[demo] Seeded workout data:', result)
}

maybeSeedFromUrl()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
