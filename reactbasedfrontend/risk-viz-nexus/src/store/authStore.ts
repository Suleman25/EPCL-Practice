import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate login
        await new Promise(resolve => setTimeout(resolve, 1000))
        const user: User = {
          id: '1',
          name: 'Safety Manager',
          email,
          role: 'admin'
        }
        const token = 'mock-jwt-token'
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      setUser: (user) => set({ user })
    }),
    {
      name: 'auth-storage'
    }
  )
)