import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { User, Mail, Shield, Server, CheckCircle2, XCircle, Moon, Sun, Camera } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [health, setHealth] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
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
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold">
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

  <div>
    <p className="font-medium">Profile Photo</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
      JPG, PNG or WEBP. Max 5MB.
    </p>

    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-brand text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
      <Camera className="w-4 h-4" />
      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
      <input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  className="hidden"
  disabled={uploadingPhoto}
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingPhoto(true)

      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.post('/auth/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      updateUser(data)

      toast.success('Profile photo updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload profile photo')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }}
/>
    </label>
  </div>
</div>
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
