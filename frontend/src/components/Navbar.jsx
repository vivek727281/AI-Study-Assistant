import { useState, useEffect } from 'react'
import { Menu, Sun, Moon, LogOut, BrainCircuit } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('sa_theme') !== 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('sa_theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-100 dark:border-white/5">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">StudyAI</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Toggle theme"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-white/10">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
              {user?.profile_image ? (
                <img
                  src={`http://127.0.0.1:8000${user.profile_image}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.full_name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{user?.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
