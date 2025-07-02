export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  role: "user" | "admin"
  is_active: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  slug: string
  created_at: string
}

export interface Video {
  id: number
  title: string
  description?: string
  thumbnail_url?: string
  video_url: string
  hls_url?: string
  duration?: number
  price: number
  access_level: 0 | 1
  category_id: number
  is_active: boolean
  created_at: string
  category: Category
}

export interface Purchase {
  id: number
  video_id: number
  amount: number
  payment_method: string
  status: "pending" | "completed" | "failed"
  created_at: string
  video: Video
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface VideoStats {
  video_id: number
  title: string
  total_purchases: number
  total_revenue: number
  total_views: number
}

export interface AdminStats {
  total_users: number
  total_videos: number
  total_revenue: number
  recent_purchases: Purchase[]
}
