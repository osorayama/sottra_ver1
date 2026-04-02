import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

export default function MapComponent({
  center = [139.6917, 35.6895],
  zoom = 13,
  markers = [],
  routes = [],
  userPos = null,
  onLocateReady = null,
  flyToTarget = null,
  searchPin = null,
  className = 'w-full h-full',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const userPosRef = useRef(userPos)
  const markerInstancesRef = useRef([])   // 投稿・現在地マーカーのインスタンス
  const routeCountRef = useRef(0)         // 前回追加したルート数
  const searchMarkerRef = useRef(null)    // 検索結果ピン

  // ── userPos を ref に同期 ──────────────────────────────
  useEffect(() => { userPosRef.current = userPos }, [userPos])

  // ── 現在地に戻るコールバックを親に渡す ───────────────────
  useEffect(() => {
    if (!onLocateReady) return
    onLocateReady(() => {
      const pos = userPosRef.current
      if (pos && mapRef.current) {
        mapRef.current.flyTo({ center: [pos.lng, pos.lat], zoom: 14, duration: 800 })
      }
    })
  }, [onLocateReady])

  // ── 検索結果の座標に flyTo ──────────────────────────────
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 13,
      duration: 1000,
    })
  }, [flyToTarget])

  // ── 検索結果ピン（オレンジ）────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    if (searchMarkerRef.current) { searchMarkerRef.current.remove(); searchMarkerRef.current = null }
    if (!searchPin) return
    const el = document.createElement('div')
    el.style.cssText = `width:20px;height:20px;border-radius:50%;
      background:#FF9800;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);`
    const m = new maplibregl.Marker({ element: el })
      .setLngLat([searchPin.lng, searchPin.lat])
      .addTo(mapRef.current)
    if (searchPin.label) {
      m.setPopup(
        new maplibregl.Popup({ offset: 16 })
          .setHTML(`<div style="font-size:12px;max-width:180px;word-break:break-word">${searchPin.label}</div>`)
      )
      setTimeout(() => m.togglePopup(), 600)
    }
    searchMarkerRef.current = m
  }, [searchPin])

  // ── マップ本体の初期化（1回だけ）────────────────────────
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center,
      zoom,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── マーカー：データが変わるたびに全削除→再追加 ─────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const draw = () => {
      markerInstancesRef.current.forEach((m) => m.remove())
      markerInstancesRef.current = []
      markers.forEach(({ lat, lng, color = '#4DB6E5', popup, onClick }) => {
        const el = document.createElement('div')
        el.style.cssText = `
          width:16px;height:16px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer;`
        const m = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map)
        if (popup) m.setPopup(new maplibregl.Popup({ offset: 14 }).setHTML(popup))
        if (onClick) el.addEventListener('click', (e) => { e.stopPropagation(); onClick() })
        markerInstancesRef.current.push(m)
      })
    }
    if (map.loaded()) draw(); else map.once('load', draw)
  }, [markers]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── ルート：データが変わるたびに全削除→再追加 ───────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const draw = () => {
      // 前回追加したレイヤー/ソースを削除
      for (let i = 0; i < routeCountRef.current; i++) {
        const id = `route-${i}`
        if (map.getLayer(id)) map.removeLayer(id)
        if (map.getSource(id)) map.removeSource(id)
      }
      routeCountRef.current = routes.length
      routes.forEach((route, i) => {
        if (route.length < 2) return
        const id = `route-${i}`
        map.addSource(id, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: route.map((p) => [p.lng, p.lat]) },
          },
        })
        map.addLayer({
          id,
          type: 'line',
          source: id,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#4DB6E5', 'line-width': 4, 'line-opacity': 0.85 },
        })
      })
    }
    if (map.loaded()) draw(); else map.once('load', draw)
  }, [routes]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className={className} />
}
