import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMyPosts } from '../services/postService'
import { getFollowingIds } from '../services/socialService'

export default function MyPage() {
  const { currentUser, logOut } = useAuth()
  const navigate = useNavigate()
  const [myPosts, setMyPosts] = useState([])
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    getMyPosts(currentUser.uid).then(setMyPosts).catch(console.error)
    getFollowingIds(currentUser.uid)
      .then((ids) => setFollowingCount(ids.length))
      .catch(console.error)
  }, [currentUser.uid])

  async function handleLogout() {
    await logOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F5FBFF] pb-24">
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">マイページ</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* プロフィールカード */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#4DB6E5]/15 overflow-hidden flex items-center justify-center shrink-0">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-base truncate">
              {currentUser.displayName || 'Traveler'}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{currentUser.email}</p>
            <div className="flex gap-5 mt-2">
              <div>
                <p className="text-base font-bold text-gray-800">{myPosts.length}</p>
                <p className="text-xs text-gray-400">投稿</p>
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{followingCount}</p>
                <p className="text-xs text-gray-400">旅友達</p>
              </div>
            </div>
          </div>
        </div>

        {/* 投稿グリッド */}
        {myPosts.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2 px-1">投稿一覧</p>
            <div className="grid grid-cols-3 gap-1.5">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  {post.imageUrls?.[0] ? (
                    <img src={post.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📸</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-400 font-medium py-3 rounded-2xl text-sm"
        >
          ログアウト
        </button>
      </div>
    </div>
  )
}
