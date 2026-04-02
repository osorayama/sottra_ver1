import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeChats } from '../services/chatService'

export default function ChatList() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])

  useEffect(() => {
    const unsub = subscribeChats(currentUser.uid, setChats)
    return unsub
  }, [currentUser.uid])

  return (
    <div className="min-h-screen bg-[#F5FBFF] pb-20">
      <header className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">チャット</h1>
      </header>

      {chats.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>チャットはまだありません</p>
          <p className="text-xs mt-1">「近くの旅人」からチャットを始めよう</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {chats.map((chat) => {
            const otherId = chat.memberIds.find((id) => id !== currentUser.uid)
            const dateStr = chat.lastMessageAt
              ? new Date(chat.lastMessageAt.toDate()).toLocaleDateString('ja-JP')
              : ''
            return (
              <div
                key={chat.id}
                className="bg-white px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50"
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-[#4DB6E5]/15 flex items-center justify-center shrink-0">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {otherId?.slice(0, 8) ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {chat.lastMessage || 'メッセージなし'}
                  </p>
                </div>
                {dateStr && (
                  <span className="text-xs text-gray-300 shrink-0">{dateStr}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
