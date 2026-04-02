import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRouteTracker } from '../hooks/useRouteTracker'
import { uploadImages, createPost } from '../services/postService'
import { updateLocation } from '../services/userService'

export default function CreatePost() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { route, tracking, start, stop } = useRouteTracker()

  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  function handleFiles(e) {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  function getLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('位置情報を取得できませんでした')
    )
  }

  async function handleSubmit() {
    if (!images.length) return alert('写真を選んでください')
    if (!caption.trim()) return alert('キャプションを入力してください')
    if (tracking) stop()
    setSubmitting(true)
    try {
      const imageUrls = await uploadImages(currentUser.uid, images)
      if (location) {
        await updateLocation(currentUser.uid, location.lat, location.lng)
      }
      await createPost({
        uid: currentUser.uid,
        authorName: currentUser.displayName || 'Traveler',
        authorPhotoURL: currentUser.photoURL || null,
        caption: caption.trim(),
        imageUrls,
        location: location ?? null,
        route: route.length > 1 ? route : [],
      })
      navigate('/')
    } catch (e) {
      alert('投稿に失敗しました: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5FBFF]">
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800">新しい投稿</h1>
      </header>

      <div className="p-4 space-y-4 pb-8">
        {/* 写真選択 */}
        <div
          className="bg-white rounded-2xl p-4 border-2 border-dashed border-[#4DB6E5] flex flex-col items-center cursor-pointer min-h-[140px] justify-center"
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
          {previews.length ? (
            <div className="grid grid-cols-3 gap-1.5 w-full">
              {previews.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  className="w-full aspect-square object-cover rounded-xl"
                  alt=""
                />
              ))}
            </div>
          ) : (
            <>
              <span className="text-4xl">📷</span>
              <p className="text-[#4DB6E5] font-medium mt-2 text-sm">
                写真を選択（最大5枚）
              </p>
            </>
          )}
        </div>

        {/* キャプション */}
        <div className="bg-white rounded-2xl p-4">
          <textarea
            className="w-full text-sm text-gray-700 outline-none resize-none placeholder-gray-300"
            rows={4}
            placeholder="旅の記録を書こう..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* 位置情報 */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {location
              ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
              : '📍 現在地を取得'}
          </span>
          <button
            onClick={getLocation}
            className="bg-[#4DB6E5] text-white text-sm px-4 py-1.5 rounded-full"
          >
            取得
          </button>
        </div>

        {/* ルート記録 */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">ルート記録</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {route.length > 0
                ? `${route.length} ポイント取得済み`
                : 'GPSでルートを記録します'}
            </p>
          </div>
          {!tracking ? (
            <button
              onClick={start}
              className="bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-full"
            >
              記録開始
            </button>
          ) : (
            <button
              onClick={stop}
              className="bg-red-400 text-white text-sm px-4 py-1.5 rounded-full animate-pulse"
            >
              停止
            </button>
          )}
        </div>

        {/* 投稿ボタン */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#4DB6E5] text-white font-bold py-3.5 rounded-2xl text-base disabled:opacity-50 transition-opacity"
        >
          {submitting ? '投稿中...' : '投稿する'}
        </button>
      </div>
    </div>
  )
}
