import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('sa_user')
    const token = localStorage.getItem('sa_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sa_token', data.access_token)
    localStorage.setItem('sa_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (full_name, email, password) => {
    const { data } = await api.post('/auth/register', { full_name, email, password })
    localStorage.setItem('sa_token', data.access_token)
    localStorage.setItem('sa_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }
  const updateUser = (updatedUser) => {
  localStorage.setItem('sa_user', JSON.stringify(updatedUser))
  setUser(updatedUser)
  }

  const logout = () => {
    localStorage.removeItem('sa_token')
    localStorage.removeItem('sa_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
