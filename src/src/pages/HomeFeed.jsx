import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import { getMyPosts } from '../services/postService'
import PostCard from '../components/PostCard'

export default function HomeFeed() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyPosts(currentUser.uid)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentUser.uid])

  return (
    <div className="min-h-screen bg-[#F5FBFF] pb-20">
      {/* ヘッダー */}
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#4DB6E5] tracking-tight">
          🗺️ Sottra
        </h1>
        <p className="text-sm font-medium text-gray-600 truncate max-w-[160px]">
          {currentUser.displayName || 'Traveler'}
        </p>
      </header>

      {/* フィード */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">✈️</p>
            <p className="font-medium text-gray-500">まだ旅の記録がありません</p>
            <p className="text-sm mt-1">写真でルートを記録しよう！</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-5 bg-[#4DB6E5] text-white px-7 py-2.5 rounded-full text-sm font-medium"
            >
              最初の投稿をする
            </button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* 投稿 FAB */}
      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#4DB6E5] text-white rounded-full shadow-xl text-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
        aria-label="新規投稿"
      >
        ✈️
      </button>
    </div>
  )
}
