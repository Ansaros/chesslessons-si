import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Video, Category, Purchase } from "./types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
}

interface VideoState {
  currentVideo: Video | null
  videos: Video[]
  categories: Category[]
  purchases: Purchase[]
  setCurrentVideo: (video: Video | null) => void
  setVideos: (videos: Video[]) => void
  setCategories: (categories: Category[]) => void
  setPurchases: (purchases: Purchase[]) => void
  addPurchase: (purchase: Purchase) => void
}

interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark"
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: "light" | "dark") => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => {
        // Сохраняем токен в cookies
        document.cookie = `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 дней
        set({ user, isAuthenticated: true })
      },
      logout: () => {
        // Удаляем токен из cookies
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export const useVideoStore = create<VideoState>((set) => ({
  currentVideo: null,
  videos: [],
  categories: [],
  purchases: [],
  setCurrentVideo: (video) => set({ currentVideo: video }),
  setVideos: (videos) => set({ videos }),
  setCategories: (categories) => set({ categories }),
  setPurchases: (purchases) => set({ purchases }),
  addPurchase: (purchase) =>
    set((state) => ({
      purchases: [...state.purchases, purchase],
    })),
}))

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: "light",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ui-storage",
    },
  ),
)
