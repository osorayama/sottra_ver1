import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

/** ログイン時にユーザー情報を作成/更新 */
export async function createOrUpdateUser(user) {
  const ref = doc(db, 'users', user.uid)
  await setDoc(
    ref,
    {
      uid: user.uid,
      displayName: user.displayName || 'Traveler',
      photoURL: user.photoURL || null,
    },
    { merge: true }
  )
}

/** 現在地を Firestore に保存（ドキュメントがなければ作成） */
export async function updateLocation(uid, lat, lng) {
  const ref = doc(db, 'users', uid)
  await setDoc(
    ref,
    { currentLocation: { lat, lng, updatedAt: serverTimestamp() } },
    { merge: true }
  )
}

/** 全ユーザーを取得 */
export async function getUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
