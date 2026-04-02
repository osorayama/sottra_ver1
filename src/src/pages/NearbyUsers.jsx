import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNearbyUsers } from '../hooks/useNearbyUsers'
import { formatDistance } from '../utils/geoUtils'
import { getOrCreateChat } from '../services/chatService'
import { getFollowingIds, followUser, unfollowUser } from '../services/socialService'

export default function NearbyUsers() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [myPos, setMyPos] = useState({ lat: null, lng: null })
  const [loading, setLoading] = useState(true)
  const [followingIds, setFollowingIds] = useState([])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => setLoading(false)
    )
    getFollowingIds(currentUser.uid).then(setFollowingIds).catch(console.error)
  }, [currentUser.uid])

  const users = useNearbyUsers(myPos.lat, myPos.lng).filter(
    (u) => u.id !== currentUser.uid
  )

  async function handleChat(uid) {
    try {
      const chatId = await getOrCreateChat(currentUser.uid, uid)
      navigate(`/chat/${chatId}`)
    } catch (e) {
      alert('チャットを開けませんでした')
    }
  }

  async function handleFollow(uid) {
    const already = followingIds.includes(uid)
    if (already) {
      await unfollowUser(currentUser.uid, uid)
      setFollowingIds(followingIds.filter((id) => id !== uid))
    } else {
      await followUser(currentUser.uid, uid)
      setFollowingIds([...followingIds, uid])
    }
  }

  return (
    <div className="min-h-screen bg-[#F5FBFF] pb-20">
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800">近くの旅人</h1>
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🧭</p>
            <p>近くに旅人が見つかりません</p>
            <p className="text-xs mt-1">50km 圈内を探しています</p>
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[#4DB6E5]/15 flex items-center justify-center overflow-hidden shrink-0">
                {u.photoURL ? (
                  <img src={u.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {u.displayName || 'Traveler'}
                </p>
                <p className="text-xs text-[#4DB6E5] mt-0.5">
                  📍 {formatDistance(u.distance)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleFollow(u.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    followingIds.includes(u.id)
                      ? 'bg-[#4DB6E5]/10 border-[#4DB6E5]/30 text-[#4DB6E5]'
                      : 'border-[#4DB6E5] text-[#4DB6E5]'
                  }`}
                >
                  {followingIds.includes(u.id) ? '旅友達✓' : '旅友達+'}
                </button>
                <button
                  onClick={() => handleChat(u.id)}
                  className="bg-[#4DB6E5] text-white text-xs px-3 py-1.5 rounded-full"
                >
                  チャット
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
