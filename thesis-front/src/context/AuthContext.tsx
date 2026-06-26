import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { UserProfile } from '../types'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: Record<string, unknown>) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)

  const refreshProfile = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setUser(null)
      return
    }
    try {
      const profile = await api.getProfile()
      setUser(profile)
    } catch {
      localStorage.removeItem('access_token')
      setUser(null)
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  const login = async (username: string, password: string) => {
    const tokens = await api.login(username, password)
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    await refreshProfile()
  }

  const register = async (data: Record<string, unknown>) => {
    await api.register(data)
    await login(data.username as string, data.password as string)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
