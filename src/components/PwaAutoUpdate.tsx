import { useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'

const UPDATE_INTERVAL_MS = 30 * 60 * 1000

export function PwaAutoUpdate() {
  useEffect(() => {
    let intervalId: number | undefined
    let registration: ServiceWorkerRegistration | undefined

    const checkForUpdate = () => {
      registration?.update().catch(() => {})
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }

    const onControllerChange = () => window.location.reload()

    registerSW({
      immediate: true,
      onRegistered(r) {
        registration = r
        if (!registration) return
        intervalId = window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS)
      },
      onRegisterError(error) {
        console.error('[pwa] Service worker registration failed:', error)
      },
      onNeedReload() {
        window.location.reload()
      },
    })

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', checkForUpdate)
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange)

    return () => {
      if (intervalId) window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', checkForUpdate)
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
