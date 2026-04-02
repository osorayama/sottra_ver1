import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toggleLike } from '../services/socialService'

export default function PostCard({ post }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [likedBy, setLikedBy] = useState(post.likedBy ?? [])
  const [toggling, setToggling] = useState(false)

  const isLiked = likedBy.includes(currentUser.uid)

  const dateStr = post.createdAt?.toDate
    ? new Date(post.createdAt.toDate()).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      })
    : ''

  async function handleLike(e) {
    e.stopPropagation()
    if (toggling) return
    const newLikedBy = isLiked
      ? likedBy.filter((id) => id !== currentUser.uid)
      : [...likedBy, currentUser.uid]
    setLikedBy(newLikedBy)
    setToggling(true)
    try {
      await toggleLike(post.id, currentUser.uid)
    } catch {
      setLikedBy(likedBy)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
      {/* 著者ヘッダー */}
      <button
        className="w-full flex items-center gap-2.5 px-4 pt-3 pb-2 text-left"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <div className="w-8 h-8 rounded-full bg-[#4DB6E5]/15 flex items-center justify-center overflow-hidden shrink-0">
          {post.authorPhotoURL ? (
            <img src={post.authorPhotoURL} className="w-full h-full object-cover" alt="" />
          ) : (
            <span className="text-sm">👤</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">
            {post.authorName || 'Traveler'}
          </p>
          {dateStr && <p className="text-[10px] text-gray-400">{dateStr}</p>}
        </div>
      </button>

      {/* 画像 */}
      {post.imageUrls?.[0] && (
        <div className="cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
          <img src={post.imageUrls[0]} alt="" className="w-full h-52 object-cover" />
        </div>
      )}

      {/* アクションバー */}
      <div className="px-4 pt-2.5 pb-1 flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-1 py-1 rounded-lg transition-all ${
            isLiked ? 'text-[#FF6B6B]' : 'text-gray-400'
          }`}
        >
          <span className={`text-xl transition-transform ${isLiked ? 'scale-125' : ''}`}>
            ✈️
          </span>
          {likedBy.length > 0 && (
            <span className="text-xs font-medium">{likedBy.length}</span>
          )}
        </button>
        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className="flex items-center gap-1 px-1 py-1 text-gray-400"
        >
          <span className="text-xl">💬</span>
          {(post.commentCount ?? 0) > 0 && (
            <span className="text-xs">{post.commentCount}</span>
          )}
        </button>
        {post.route?.length > 1 && (
          <span className="ml-auto text-[10px] text-gray-300">
            🗺️ {post.route.length}pt
          </span>
        )}
      </div>

      {/* キャプション */}
      <div
        className="px-4 pb-3.5 cursor-pointer"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        {post.caption && (
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            <span className="font-semibold text-gray-800">
              {post.authorName || 'Traveler'}{' '}
            </span>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  )
}
