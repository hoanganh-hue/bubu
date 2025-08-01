import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import type { AdminUser } from '@/types'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

interface AuthState {
  user: AdminUser | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  error: string | null
  setUser: (user: AdminUser | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

export const useAuthStore = create<AuthState>()((
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      isAdmin: false,
      error: null,

      setUser: (user) => {
        set({ user, isAdmin: user?.role === 'admin' && user?.is_active });
      },

      setToken: (token) => {
        set({ token });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await apiClient.post('/auth/login', { email, password });
          set({ token: data.token, loading: false });
          const { data: user } = await apiClient.get('/auth/user');
          get().setUser(user);
        } catch (error: any) {
          console.error('Sign in failed:', error);
          set({ loading: false, error: error.response?.data?.error || 'Sign in failed' });
        }
      },

      signOut: () => {
        set({ user: null, token: null, isAdmin: false, error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
))