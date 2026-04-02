import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase'
import { createOrUpdateUser } from '../services/userService'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /** メール＆パスワードで新規登録 */
  async function signUp(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    // updateProfile 完了後に state を更新（onAuthStateChanged より先に反映させる）
    setCurrentUser({ ...auth.currentUser })
  }

  /** メール＆パスワードでログイン */
  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  /** Google ポップアップでログイン */
  function logInWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  /** ログアウト */
  function logOut() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
      // ログイン済みなら Firestore のユーザー情報を最新に同期
      if (user) createOrUpdateUser(user).catch(console.error)
    })
    return unsubscribe
  }, [])

  const value = { currentUser, signUp, logIn, logInWithGoogle, logOut }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
