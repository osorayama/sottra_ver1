import { useState, useRef, useCallback } from 'react'

/** GPS watchPosition でルートを記録するフック */
export function useRouteTracker() {
  const [route, setRoute] = useState([])
  const [tracking, setTracking] = useState(false)
  const watchIdRef = useRef(null)

  const start = useCallback(() => {
    setRoute([])
    setTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setRoute((prev) => [
          ...prev,
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: Date.now(),
          },
        ])
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true }
    )
  }, [])

  const stop = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
  }, [])

  return { route, tracking, start, stop }
}
