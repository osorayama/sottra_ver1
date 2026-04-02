import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'

/** 画像ファイル配列を Storage にアップロードして URL 配列を返す */
export async function uploadImages(uid, files) {
  const urls = []
  const groupId = Date.now().toString() // ルールの {routeId} 相当
  for (const file of files) {
    const storageRef = ref(storage, `routes/${uid}/${groupId}/${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    urls.push(url)
  }
  return urls
}

/** 投稿を Firestore に保存 */
export async function createPost(postData) {
  return addDoc(collection(db, 'posts'), {
    ...postData,
    createdAt: serverTimestamp(),
  })
}

/** 全投稿を新しい順で取得 */
export async function getPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** 単一投稿を取得 */
export async function getPost(id) {
  const snap = await getDoc(doc(db, 'posts', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** 自分の投稿を新しい順で取得 */
export async function getMyPosts(uid) {
  const q = query(collection(db, 'posts'), where('uid', '==', uid))
  const snap = await getDocs(q)
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return posts.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

/** 複数 UID の投稿を新しい順で取得（フォロー中のフィード用） */
export async function getPostsByUids(uids) {
  if (!uids.length) return []
  const chunk = uids.slice(0, 30) // Firestore in クエリ上限
  const q = query(collection(db, 'posts'), where('uid', 'in', chunk))
  const snap = await getDocs(q)
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return posts.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
}

/** 投稿を更新（自分の投稿のみ） */
export async function updatePost(id, data) {
  await updateDoc(doc(db, 'posts', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/** 投稿を削除 */
export async function deletePost(id) {
  await deleteDoc(doc(db, 'posts', id))
}
