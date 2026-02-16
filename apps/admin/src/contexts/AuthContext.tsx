import { createContext, useContext, useEffect, useState } from 'react'
import type { Login } from '@treino/shared'
import {
  authApi,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../lib/api'
import type { AuthUser } from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: Login) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken()
      if (!accessToken) {
        setIsLoading(false)
        return
      }
      try {
        const res = await authApi.me()
        if (res.success) {
          setUser(res.data)
        } else {
          clearTokens()
        }
      } catch {
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (data: Login) => {
    const res = await authApi.login(data)
    if (!res.success) {
      throw new Error(res.message ?? 'Login failed')
    }
    setTokens(res.data.accessToken, res.data.refreshToken)
    setUser(res.data.user)
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // best effort
      }
    }
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
