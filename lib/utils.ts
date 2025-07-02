import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Video, Purchase } from "./types" // Assuming Video and Purchase are declared in a types file

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("kk-KZ", {
    style: "currency",
    currency: "KZT",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getVideoThumbnail(video: Video): string {
  return video.thumbnail_url || "/placeholder.svg?height=200&width=300"
}

export function canAccessVideo(video: Video, purchases: Purchase[]): boolean {
  if (video.access_level === 0) return true // Бесплатное видео

  return purchases.some((purchase) => purchase.video_id === video.id && purchase.status === "completed")
}

export function getErrorMessage(error: any): string {
  if (error?.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error?.message) {
    return error.message
  }
  return "Произошла неизвестная ошибка"
}
