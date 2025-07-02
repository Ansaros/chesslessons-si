import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import { authAPI, usersAPI } from "@/lib/api"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  updateProfile: (data: { full_name: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login({ email, password })
          const { access_token } = response.data

          localStorage.setItem("access_token", access_token)

          // Загружаем профиль пользователя
          const profileResponse = await authAPI.getProfile()

          set({
            token: access_token,
            user: profileResponse.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.register(data)

          // После регистрации автоматически логинимся
          await get().login(data.email, data.password)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem("access_token")
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      loadUser: async () => {
        const token = localStorage.getItem("access_token")
        if (!token) return

        set({ isLoading: true })
        try {
          const response = await authAPI.getProfile()
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          localStorage.removeItem("access_token")
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateProfile: async (data) => {
        try {
          await usersAPI.updateProfile(data)
          const response = await authAPI.getProfile()
          set({ user: response.data })
        } catch (error) {
          throw error
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
