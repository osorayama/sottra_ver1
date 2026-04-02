import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

/** チャットを取得 or 新規作成してIDを返す */
export async function getOrCreateChat(uid1, uid2) {
  const q = query(
    collection(db, 'chats'),
    where('memberIds', 'array-contains', uid1)
  )
  const snap = await getDocs(q)
  const existing = snap.docs.find((d) => d.data().memberIds.includes(uid2))
  if (existing) return existing.id

  const ref = await addDoc(collection(db, 'chats'), {
    memberIds: [uid1, uid2],
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
  })
  return ref.id
}

/** チャット一覧をリアルタイム購読 */
export function subscribeChats(uid, callback) {
  const q = query(
    collection(db, 'chats'),
    where('memberIds', 'array-contains', uid)
  )
  return onSnapshot(q, (snap) => {
    const chats = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.lastMessageAt?.toMillis?.() ?? 0) - (a.lastMessageAt?.toMillis?.() ?? 0))
    callback(chats)
  })
}

/** メッセージをリアルタイム購読 */
export function subscribeMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

/** メッセージを送信 */
export async function sendMessage(chatId, senderId, text) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  })
}
