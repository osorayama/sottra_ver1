import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../hooks/useChat'

export default function ChatRoom() {
  const { chatId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { messages, sendMessage } = useChat(chatId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      await sendMessage(currentUser.uid, trimmed)
      setText('')
    } catch (e) {
      alert('送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F5FBFF]">
      {/* ヘッダー */}
      <header className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg">←</button>
        <h1 className="text-base font-bold text-gray-800">チャット</h1>
      </header>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            メッセージを送って会話を始めよう 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser.uid
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-[#4DB6E5] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex gap-2 items-center shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="メッセージを入力..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="bg-[#4DB6E5] text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
