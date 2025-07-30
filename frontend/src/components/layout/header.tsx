"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { TokenStorage } from "@/services/auth/auth-service";

export const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if the current user is an admin based on their email
    const checkIfAdmin = async () => {
      try {
        // We're using the same admin check logic as in login-view.tsx
        // In a real app, this would be based on a role from the backend
        const token = TokenStorage.getAccessToken();
        if (token) {
          // For demo purposes, we're checking if the user is admin@chess.com
          // In a real app, you would decode the JWT token or make an API call
          const storedEmail = localStorage.getItem("user_email") || sessionStorage.getItem("user_email");
          setIsAdmin(storedEmail === "admin@chess.com");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    if (isAuthenticated) {
      checkIfAdmin();
    }
  }, [isAuthenticated]);

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/chess-logo.png"
              alt="Chester Chess Club"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-800">Chester Chess Club</h1>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/videos" className="text-amber-600 font-medium">
              Видеоуроки
            </Link>
            <Link 
              href={isAdmin ? "/admin" : "/profile"} 
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              Профиль
            </Link>
            {isAuthenticated ? (
              <button 
                onClick={() => logout()}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                Выйти
              </button>
            ) : (
              <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                Войти
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};