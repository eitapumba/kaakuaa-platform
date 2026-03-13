'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from './api'

interface User {
  id: string
  email: string
  displayName: string
  rank: string
  vitaBalance: number
  challengesWon: number
  challengesCompleted: number
  currentStreak: number
  totalEarnings: number
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }
      const data = await api.getMe()
      setUser(data)
      setError(null)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const { accessToken, refreshToken } = await api.login({ email, password })
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      await refreshUser()
    } catch (err: any) {
      setError('Email ou senha incorretos')
      setLoading(false)
      throw err
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    setError(null)
    setLoading(true)
    try {
      const { accessToken, refreshToken } = await api.register({ email, password, displayName })
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      await refreshUser()
    } catch (err: any) {
      setError('Erro ao criar conta. Email já cadastrado?')
      setLoading(false)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
