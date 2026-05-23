import { create } from 'zustand'
import { authApi } from '@/services/api'

interface User {
  id: number
  email: string
  is_active: boolean
  role?: {
    id: number
    name: string
    description?: string
  }
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await authApi.login(email, password)
      if (typeof window !== 'undefined') {
        localStorage.setItem('sentinel_token', data.access_token)
        localStorage.setItem('sentinel_user', JSON.stringify(data.user))
      }
      set({ user: data.user, token: data.access_token, isLoading: false })
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check credentials.'
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sentinel_token')
      localStorage.removeItem('sentinel_user')
    }
    set({ user: null, token: null })
  },

  initialize: async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('sentinel_token')
    const userStr = localStorage.getItem('sentinel_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token })
        // Verify token is still valid
        const { data } = await authApi.me()
        set({ user: data })
      } catch {
        localStorage.removeItem('sentinel_token')
        localStorage.removeItem('sentinel_user')
        set({ user: null, token: null })
      }
    }
  },
}))
