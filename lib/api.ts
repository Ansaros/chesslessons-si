import axios from "axios"
import type { AuthResponse, User, Video, Category, Purchase, AdminStats, VideoStats } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post<User>("/api/auth/register", data),

  login: (data: { email: string; password: string }) => api.post<AuthResponse>("/api/auth/login", data),

  getProfile: () => api.get<User>("/api/auth/me"),
}

// Videos API
export const videosAPI = {
  getVideos: (params?: { category_id?: number; access_level?: number; skip?: number; limit?: number }) =>
    api.get<Video[]>("/api/videos", { params }),

  getVideo: (id: number) => api.get<Video>(`/api/videos/${id}`),

  getVideoStream: (id: number) =>
    api.get<{ hls_url: string; video_url: string; title: string }>(`/api/videos/${id}/stream`),

  getVideosByCategory: (categoryId: number, params?: { skip?: number; limit?: number }) =>
    api.get<Video[]>(`/api/videos/category/${categoryId}`, { params }),
}

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get<Category[]>("/api/categories"),

  getCategory: (id: number) => api.get<Category>(`/api/categories/${id}`),
}

// Payments API
export const paymentsAPI = {
  createPurchase: (data: { video_id: number; payment_method: string }) =>
    api.post<{ purchase_id: number; payment_url: string; status: string }>("/api/payments/purchase", data),

  getPurchases: () => api.get<Purchase[]>("/api/payments/purchases"),

  verifyPurchase: (purchaseId: number) =>
    api.post<{ purchase_id: number; status: string; video_id: number; amount: number }>(
      `/api/payments/purchases/${purchaseId}/verify`,
    ),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get<User>("/api/users/profile"),

  updateProfile: (data: { full_name: string }) => api.put("/api/users/profile", data),

  getPurchases: () => api.get<Purchase[]>("/api/users/purchases"),

  getWatchHistory: () => api.get("/api/users/watch-history"),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get<AdminStats>("/api/admin/stats"),

  getVideoStats: () => api.get<VideoStats[]>("/api/admin/videos/stats"),

  uploadVideo: (formData: FormData) =>
    api.post("/api/admin/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateVideo: (id: number, data: Partial<Video>) => api.put<Video>(`/api/admin/videos/${id}`, data),

  deleteVideo: (id: number) => api.delete(`/api/admin/videos/${id}`),

  getUsers: (params?: { skip?: number; limit?: number }) => api.get<User[]>("/api/admin/users", { params }),

  updateUserRole: (userId: number, role: string) => api.put(`/api/admin/users/${userId}/role`, { role }),
}

export default api
