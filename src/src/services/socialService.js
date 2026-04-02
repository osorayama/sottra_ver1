import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  setDoc,
  getDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

// ==================== いいね（行きたい！）====================

export async function toggleLike(postId, uid) {
  const postRef = doc(db, 'posts', postId)
  const snap = await getDoc(postRef)
  const likedBy = snap.data()?.likedBy ?? []
  if (likedBy.includes(uid)) {
    await updateDoc(postRef, { likedBy: arrayRemove(uid) })
    return false
  } else {
    await updateDoc(postRef, { likedBy: arrayUnion(uid) })
    return true
  }
}

// ==================== コメント ====================

export async function addComment(postId, { uid, displayName, photoURL, text }) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    uid,
    displayName,
    photoURL: photoURL ?? null,
    text,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) })
}

export async function getComments(postId) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(-1) })
}

// ==================== フォロー（旅友達）====================

export async function followUser(myUid, targetUid) {
  await setDoc(doc(db, 'users', myUid, 'following', targetUid), {
    createdAt: serverTimestamp(),
  })
}

export async function unfollowUser(myUid, targetUid) {
  await deleteDoc(doc(db, 'users', myUid, 'following', targetUid))
}

export async function getFollowingIds(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'following'))
  return snap.docs.map((d) => d.id)
}

export async function checkIsFollowing(myUid, targetUid) {
  const snap = await getDoc(doc(db, 'users', myUid, 'following', targetUid))
  return snap.exists()
}
