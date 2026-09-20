import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { User, Mail, Shield, Server, CheckCircle2, XCircle, Moon, Sun } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'

export default function Settings() {
  const { user } = useAuth()
  const [health, setHealth] = useState(null)
  const [dark, setDark] = useState(() => localStorage.getItem('sa_theme') !== 'light')

  useEffect(() => {
    api.get('/health').then(({ data }) => setHealth(data)).catch(() => setHealth({ status: 'error' }))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('sa_theme', next ? 'dark' : 'light')
    toast.success(`Switched to ${next ? 'dark' : 'light'} mode`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <Card hover={false}>
        <h2 className="font-bold text-lg mb-4">Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
              <User className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="font-medium">{user?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
              <p className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="font-bold text-lg mb-4">Appearance</h2>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {dark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
            <span className="font-medium text-sm">{dark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${dark ? 'bg-gradient-brand justify-end' : 'bg-gray-300 justify-start'}`}>
            <div className="w-5 h-5 rounded-full bg-white shadow" />
          </div>
        </button>
      </Card>

      <Card hover={false}>
        <h2 className="font-bold text-lg mb-4">AI Engine Status</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
            <Server className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ollama Connection ({health?.model || 'llama3.2'})</p>
            <p className="font-medium capitalize">{health?.ollama || 'checking...'}</p>
          </div>
          {health?.ollama?.includes('connected') ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        {!health?.ollama?.includes('connected') && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Make sure Ollama is running locally (<code>ollama serve</code>) and the model is pulled
            (<code>ollama pull llama3.2</code>).
          </p>
        )}
      </Card>
    </div>
  )
}
