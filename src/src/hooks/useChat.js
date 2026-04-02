import { useState, useEffect } from 'react'
import { subscribeMessages, sendMessage as sendMsg } from '../services/chatService'

export function useChat(chatId) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!chatId) return
    const unsub = subscribeMessages(chatId, setMessages)
    return unsub
  }, [chatId])

  const sendMessage = (senderId, text) => sendMsg(chatId, senderId, text)

  return { messages, sendMessage }
}
