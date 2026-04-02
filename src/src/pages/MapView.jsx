import { useState, useEffect, lazy, Suspense, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '../services/postService'

const MapComponent = lazy(() => import('../components/MapComponent'))

function MapLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-gray-400 mt-2">地図を読み込み中...</p>
      </div>
    </div>
  )
}

export default function MapView() {
  const [posts, setPosts] = useState([])
  const [userPos, setUserPos] = useState(null)
  const navigate = useNavigate()
  const locateFnRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [flyToTarget, setFlyToTarget] = useState(null)
  const [searchPin, setSearchPin] = useState(null)

  useEffect(() => {
    getPosts().then(setPosts).catch(console.error)
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  async function handleSearch(e) {
    e?.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearching(true)
    setSearchError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=ja`,
      )
      const data = await res.json()
      if (!data.length) {
        setSearchError('見つかりませんでした')
        return
      }
      const { lat, lon, display_name } = data[0]
      const pos = { lat: parseFloat(lat), lng: parseFloat(lon) }
      const label = display_name.split(',').slice(0, 3).join(', ')
      setFlyToTarget({ ...pos, zoom: 13 })
      setSearchPin({ ...pos, label })
    } catch {
      setSearchError('検索に失敗しました')
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchPin(null)
    setSearchError('')
  }

  const markers = [
    ...posts
      .filter((p) => p.location)
      .map((p) => ({
        lat: p.location.lat,
        lng: p.location.lng,
        color: '#4DB6E5',
        popup: `<div style="font-size:12px;max-width:120px">${p.caption?.slice(0, 40) ?? ''}</div>`,
        onClick: () => navigate(`/post/${p.id}`),
      })),
    ...(userPos
      ? [{ lat: userPos.lat, lng: userPos.lng, color: '#FF5A5A' }]
      : []),
  ]

  const routes = posts.filter((p) => p.route?.length > 1).map((p) => p.route)
  const center = userPos
    ? [userPos.lng, userPos.lat]
    : [139.6917, 35.6895]

  return (
    <div className="relative h-[100dvh] pb-16">
      <Suspense fallback={<MapLoader />}>
        <MapComponent
          center={center}
          markers={markers}
          routes={routes}
          userPos={userPos}
          onLocateReady={(fn) => { locateFnRef.current = fn }}
          flyToTarget={flyToTarget}
          searchPin={searchPin}
          className="w-full h-full"
        />
      </Suspense>

      {/* 検索バー (上部・ NavigationControl を避けるため right-14) */}
      <div className="absolute top-3 left-3 right-14 z-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="場所を検索..."
              className="w-full bg-white shadow-md rounded-full pl-4 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4DB6E5]"
            />
            {searchPin && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="bg-[#4DB6E5] text-white rounded-full w-10 h-10 shrink-0 flex items-center justify-center shadow-md disabled:opacity-50"
          >
            {searching
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <span className="text-base">🔍</span>}
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-red-400 bg-white/90 rounded-lg px-3 py-1 mt-1 ml-1 shadow">
            {searchError}
          </p>
        )}
      </div>

      {/* 右下: ボタン群 */}
      <div className="absolute bottom-20 right-3 flex flex-col gap-2">
        <button
          onClick={() => locateFnRef.current?.()}
          className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-xl"
          title="現在地に戻る"
        >
          📍
        </button>
        <button
          onClick={() => navigate('/nearby')}
          className="w-11 h-11 bg-[#4DB6E5] rounded-full shadow-lg flex items-center justify-center text-xl"
          title="近くの旅人"
        >
          🧑‍🤝‍🧑
        </button>
      </div>
    </div>
  )
}
