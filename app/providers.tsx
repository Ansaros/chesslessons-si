"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { authApi } from "@/lib/api"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут
            retry: 1,
          },
        },
      }),
  )

  const { setUser, setLoading, isAuthenticated } = useAuthStore()

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        setLoading(true)
        try {
          const user = await authApi.getMe()
          setUser(user)
        } catch (error) {
          console.error("Auth check failed:", error)
          // Если токен недействителен, пользователь будет разлогинен через интерцептор
        } finally {
          setLoading(false)
        }
      }
    }

    checkAuth()
  }, [isAuthenticated, setUser, setLoading])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
