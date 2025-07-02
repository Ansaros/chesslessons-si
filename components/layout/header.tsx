"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { Menu, X, User, LogOut, Crown } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ChessLessons</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/categories" className="text-gray-700 hover:text-primary transition-colors">
              Категории
            </Link>
            <Link href="/videos" className="text-gray-700 hover:text-primary transition-colors">
              Все уроки
            </Link>
            {isAuthenticated && (
              <Link href="/profile" className="text-gray-700 hover:text-primary transition-colors">
                Профиль
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors">
                Админка
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{user?.username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Регистрация</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/categories"
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Категории
              </Link>
              <Link
                href="/videos"
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Все уроки
              </Link>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Профиль
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Админка
                </Link>
              )}

              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm text-gray-700">{user?.username}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link href="/auth/login" className="block">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Войти
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="block">
                      <Button size="sm" className="w-full">
                        Регистрация
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
