import axios, { type AxiosError } from "axios"
import Cookies from "js-cookie"
import type {
  User,
  Video,
  Category,
  Purchase,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  VideoStats,
  AdminStats,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Удаляем токен и перенаправляем на логин
      Cookies.remove("access_token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post("/api/auth/register", data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/api/auth/me")
    return response.data
  },
}

// Videos API
export const videosApi = {
  getVideos: async (params?: {
    category_id?: number
    access_level?: 0 | 1
    skip?: number
    limit?: number
  }): Promise<Video[]> => {
    const response = await api.get("/api/videos", { params })
    return response.data
  },

  getVideo: async (id: number): Promise<Video> => {
    const response = await api.get(`/api/videos/${id}`)
    return response.data
  },

  getVideoStream: async (
    id: number,
  ): Promise<{
    hls_url: string
    video_url: string
    title: string
  }> => {
    const response = await api.get(`/api/videos/${id}/stream`)
    return response.data
  },

  getVideosByCategory: async (
    categoryId: number,
    params?: {
      skip?: number
      limit?: number
    },
  ): Promise<Video[]> => {
    const response = await api.get(`/api/videos/category/${categoryId}`, { params })
    return response.data
  },
}

// Categories API
export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/api/categories")
    return response.data
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get(`/api/categories/${id}`)
    return response.data
  },
}

// Purchases API
export const purchasesApi = {
  createPurchase: async (data: {
    video_id: number
    payment_method: string
  }): Promise<{
    purchase_id: number
    payment_url: string
    status: string
  }> => {
    const response = await api.post("/api/payments/purchase", data)
    return response.data
  },

  getPurchases: async (): Promise<Purchase[]> => {
    const response = await api.get("/api/payments/purchases")
    return response.data
  },

  verifyPurchase: async (
    purchaseId: number,
  ): Promise<{
    purchase_id: number
    status: string
    video_id: number
    amount: number
  }> => {
    const response = await api.post(`/api/payments/purchases/${purchaseId}/verify`)
    return response.data
  },
}

// Users API
export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get("/api/users/profile")
    return response.data
  },

  updateProfile: async (data: { full_name: string }): Promise<{ message: string }> => {
    const response = await api.put("/api/users/profile", data)
    return response.data
  },

  getWatchHistory: async (): Promise<
    Array<{
      video_id: number
      video_title: string
      viewed_at: string
      watch_duration?: number
    }>
  > => {
    const response = await api.get("/api/users/watch-history")
    return response.data
  },
}

// Admin API
export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get("/api/admin/stats")
    return response.data
  },

  getVideoStats: async (): Promise<VideoStats[]> => {
    const response = await api.get("/api/admin/videos/stats")
    return response.data
  },

  uploadVideo: async (
    formData: FormData,
  ): Promise<{
    message: string
    video_id: number
    video_url: string
    hls_url: string
  }> => {
    const response = await api.post("/api/admin/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  updateVideo: async (id: number, data: Partial<Video>): Promise<Video> => {
    const response = await api.put(`/api/admin/videos/${id}`, data)
    return response.data
  },

  deleteVideo: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/admin/videos/${id}`)
    return response.data
  },

  getUsers: async (params?: {
    skip?: number
    limit?: number
  }): Promise<User[]> => {
    const response = await api.get("/api/admin/users", { params })
    return response.data
  },

  updateUserRole: async (userId: number, role: string): Promise<{ message: string }> => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role })
    return response.data
  },

  createCategory: async (data: {
    name: string
    description?: string
    slug: string
  }): Promise<Category> => {
    const response = await api.post("/api/categories", data)
    return response.data
  },
}

export default api
