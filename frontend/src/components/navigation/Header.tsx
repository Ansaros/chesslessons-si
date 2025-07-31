"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/chess-logo.jpg"
              alt="Chester Chess Club"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Chester Chess Club
              </h1>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/videos"
              className={`transition-colors ${
                currentPage === "videos"
                  ? "text-amber-600 font-medium"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Видеоуроки
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={`transition-colors ${
                    currentPage === "profile"
                      ? "text-amber-600 font-medium"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Профиль
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className={`transition-colors ${
                  currentPage === "login"
                    ? "text-amber-600 font-medium"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Войти
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
