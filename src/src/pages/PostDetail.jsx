import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPost, deletePost } from '../services/postService'
import { toggleLike, addComment, getComments, deleteComment } from '../services/socialService'
import ImageCarousel from '../components/ImageCarousel'

const MapComponent = lazy(() => import('../components/MapComponent'))

export default function PostDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [likedBy, setLikedBy] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getPost(id)
      .then((p) => {
        if (!p) { navigate('/'); return }
        setPost(p)
        setLikedBy(p.likedBy ?? [])
      })
      .catch(console.error)
    getComments(id).then(setComments).catch(console.error)
  }, [id, navigate])

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5FBFF]">
        <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
      </div>
    )
  }

  const isOwner = post.uid === currentUser.uid
  const isLiked = likedBy.includes(currentUser.uid)

  async function handleLike() {
    const newLikedBy = isLiked
      ? likedBy.filter((uid) => uid !== currentUser.uid)
      : [...likedBy, currentUser.uid]
    setLikedBy(newLikedBy)
    try { await toggleLike(id, currentUser.uid) }
    catch { setLikedBy(likedBy) }
  }

  async function handleComment() {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await addComment(id, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Traveler',
        photoURL: currentUser.photoURL || null,
        text: commentText.trim(),
      })
      const updated = await getComments(id)
      setComments(updated)
      setCommentText('')
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('この投稿を削除しますか？')) return
    setDeleting(true)
    try {
      await deletePost(id)
      navigate('/', { replace: true })
    } catch (e) {
      console.error(e)
      setDeleting(false)
    }
  }

  async function handleDeleteComment(commentId) {
    await deleteComment(id, commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const markers = post.location
    ? [{ lat: post.location.lat, lng: post.location.lng, color: '#4DB6E5' }]
    : []
  const routes = post.route?.length > 1 ? [post.route] : []
  const center = post.location
    ? [post.location.lng, post.location.lat]
    : [139.6917, 35.6895]
  const dateStr = post.createdAt?.toDate
    ? new Date(post.createdAt.toDate()).toLocaleString('ja-JP')
    : ''

  return (
    <div className="min-h-screen bg-[#F5FBFF] pb-8">
      {/* ヘッダー */}
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl leading-none">←</button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#4DB6E5]/15 overflow-hidden flex items-center justify-center shrink-0">
            {post.authorPhotoURL
              ? <img src={post.authorPhotoURL} className="w-full h-full object-cover" alt="" />
              : <span className="text-xs">👤</span>}
          </div>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {post.authorName || 'Traveler'}
          </p>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 text-2xl leading-none px-2 py-1"
            >
              ⋯
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full bg-white rounded-2xl shadow-xl py-1 w-40 z-50 border border-gray-100">
                  <button
                    onClick={() => { setShowMenu(false); navigate(`/edit/${id}`) }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700"
                  >
                    ✏️ 編集する
                  </button>
                  <div className="h-px bg-gray-50 mx-3" />
                  <button
                    onClick={() => { setShowMenu(false); handleDelete() }}
                    disabled={deleting}
                    className="w-full text-left px-4 py-3 text-sm text-red-400"
                  >
                    🗑️ 削除する
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* 画像 */}
      <ImageCarousel images={post.imageUrls} />

      {/* 行きたい！・コメント数 */}
      <div className="bg-white px-4 py-2.5 flex items-center gap-5 border-b border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 font-semibold transition-all ${
            isLiked ? 'text-[#FF6B6B]' : 'text-gray-400'
          }`}
        >
          <span className={`text-2xl transition-transform ${isLiked ? 'scale-110' : ''}`}>✈️</span>
          <span className="text-sm">{likedBy.length > 0 ? likedBy.length : ''}</span>
          <span className="text-sm font-normal">行きたい！</span>
        </button>
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="text-xl">💬</span>
          <span className="text-sm">{comments.length > 0 ? `${comments.length} ` : ''}コメント</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* キャプション */}
        <div className="bg-white rounded-2xl p-4">
          {post.caption && (
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-800 mr-1">{post.authorName || 'Traveler'}</span>
              {post.caption}
            </p>
          )}
          {dateStr && <p className="text-xs text-gray-400 mt-2">🕐 {dateStr}</p>}
          {post.updatedAt && <p className="text-xs text-gray-300 mt-0.5">（編集済み）</p>}
        </div>

        {/* マップ */}
        {(markers.length > 0 || routes.length > 0) && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-64">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="animate-spin w-6 h-6 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
              </div>
            }>
              <MapComponent
                center={center}
                markers={markers}
                routes={routes}
                className="w-full h-full"
              />
            </Suspense>
          </div>
        )}

        {/* コメント */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <p className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-3 border-b border-gray-50">
            コメント
          </p>
          {/* 入力欄 */}
          <div className="px-4 py-3 flex gap-3 items-center border-b border-gray-50">
            <div className="w-8 h-8 rounded-full bg-[#4DB6E5]/15 flex items-center justify-center shrink-0 overflow-hidden">
              {currentUser.photoURL
                ? <img src={currentUser.photoURL} className="w-full h-full object-cover" alt="" />
                : <span className="text-sm">👤</span>}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment()}
                placeholder="コメントを書く..."
                className="flex-1 text-sm bg-gray-50 rounded-full px-4 py-2 focus:outline-none"
              />
              <button
                onClick={handleComment}
                disabled={submitting || !commentText.trim()}
                className="bg-[#4DB6E5] text-white text-sm px-4 py-2 rounded-full disabled:opacity-40 shrink-0"
              >
                送信
              </button>
            </div>
          </div>

          {/* コメント一覧 */}
          {comments.length === 0 ? (
            <p className="text-center text-xs text-gray-300 py-6">まだコメントがありません</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {comments.map((c) => (
                <div key={c.id} className="px-4 py-3 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4DB6E5]/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {c.photoURL
                      ? <img src={c.photoURL} className="w-full h-full object-cover" alt="" />
                      : <span className="text-sm">👤</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{c.displayName || 'Traveler'}</p>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{c.text}</p>
                    {c.createdAt?.toDate && (
                      <p className="text-[10px] text-gray-300 mt-1">
                        {new Date(c.createdAt.toDate()).toLocaleString('ja-JP')}
                      </p>
                    )}
                  </div>
                  {(c.uid === currentUser.uid || isOwner) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-gray-300 text-xl shrink-0 self-start mt-0.5"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

