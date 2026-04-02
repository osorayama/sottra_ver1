import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '🏠', label: 'マイ旅' },
  { to: '/friends', icon: '👫', label: '旅友達' },
  { to: '/map', icon: '🗺️', label: 'マップ' },
  { to: '/chat', icon: '💬', label: 'チャット' },
  { to: '/profile', icon: '👤', label: 'マイページ' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 flex z-50">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              isActive ? 'text-[#4DB6E5]' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl mb-0.5">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
