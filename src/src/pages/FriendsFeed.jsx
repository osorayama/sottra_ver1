import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getFollowingIds } from '../services/socialService'
import { getPostsByUids } from '../services/postService'
import PostCard from '../components/PostCard'

export default function FriendsFeed() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const ids = await getFollowingIds(currentUser.uid)
        if (!ids.length) {
          setPosts([])
          return
        }
        const p = await getPostsByUids(ids)
        setPosts(p)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUser.uid])

  return (
    <div className="min-h-screen bg-[#F5FBFF] pb-20">
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-800">👫 旅友達</h1>
        <button
          onClick={() => navigate('/nearby')}
          className="text-xs text-[#4DB6E5] border border-[#4DB6E5] px-3 py-1.5 rounded-full"
        >
          旅人を探す
        </button>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🧭</p>
            <p className="font-medium text-gray-500">旅友達の投稿がありません</p>
            <p className="text-sm mt-1">近くの旅人をフォローしよう！</p>
            <button
              onClick={() => navigate('/nearby')}
              className="mt-5 bg-[#4DB6E5] text-white px-7 py-2.5 rounded-full text-sm font-medium"
            >
              近くの旅人を探す
            </button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
