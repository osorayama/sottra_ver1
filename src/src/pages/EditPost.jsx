import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPost, updatePost } from '../services/postService'

export default function EditPost() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [caption, setCaption] = useState('')
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPost(id).then((p) => {
      if (!p || p.uid !== currentUser.uid) {
        navigate('/', { replace: true })
        return
      }
      setPost(p)
      setCaption(p.caption || '')
      setLoading(false)
    })
  }, [id, currentUser.uid, navigate])

  async function handleSave() {
    if (!caption.trim()) return
    setSaving(true)
    try {
      await updatePost(id, { caption: caption.trim() })
      navigate(`/post/${id}`, { replace: true })
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5FBFF]">
        <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5FBFF]">
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-xl leading-none">←</button>
        <h1 className="text-base font-bold text-gray-800 flex-1">投稿を編集</h1>
        <button
          onClick={handleSave}
          disabled={saving || !caption.trim()}
          className="bg-[#4DB6E5] text-white text-sm px-4 py-1.5 rounded-full disabled:opacity-40"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </header>

      <div className="p-4 space-y-4">
        {post?.imageUrls?.[0] && (
          <img
            src={post.imageUrls[0]}
            alt=""
            className="w-full h-48 object-cover rounded-2xl"
          />
        )}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            キャプション
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={6}
            placeholder="旅の記録を書こう..."
            className="w-full mt-2 text-sm text-gray-700 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}
