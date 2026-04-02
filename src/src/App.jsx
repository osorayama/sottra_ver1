import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import BottomNav from './components/BottomNav'

// ページを遅延読み込み（チャンク分割）
const LoginPage    = lazy(() => import('./pages/LoginPage'))
const HomeFeed     = lazy(() => import('./pages/HomeFeed'))
const FriendsFeed  = lazy(() => import('./pages/FriendsFeed'))
const CreatePost   = lazy(() => import('./pages/CreatePost'))
const MapView      = lazy(() => import('./pages/MapView'))
const PostDetail   = lazy(() => import('./pages/PostDetail'))
const EditPost     = lazy(() => import('./pages/EditPost'))
const NearbyUsers  = lazy(() => import('./pages/NearbyUsers'))
const ChatList     = lazy(() => import('./pages/ChatList'))
const ChatRoom     = lazy(() => import('./pages/ChatRoom'))
const MyPage       = lazy(() => import('./pages/MyPage'))

const NAV_PATHS = ['/', '/friends', '/map', '/nearby', '/chat', '/profile']

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#F5FBFF]">
      <div className="animate-spin w-8 h-8 border-2 border-[#4DB6E5] border-t-transparent rounded-full" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? <Navigate to="/" replace /> : children
}

function Layout({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  const showNav = currentUser && NAV_PATHS.includes(location.pathname)
  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  )
}

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/" element={<PrivateRoute><HomeFeed /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><FriendsFeed /></PrivateRoute>} />
          <Route path="/map" element={<PrivateRoute><MapView /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/post/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/nearby" element={<PrivateRoute><NearbyUsers /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatList /></PrivateRoute>} />
          <Route path="/chat/:chatId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><MyPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
