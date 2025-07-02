"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function Providers({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return <>{children}</>
}
