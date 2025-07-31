"use client";

import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    chessLevels,
    user,
    login,
    register,
    logout,
    loadChessLevels,
    initializeAuth,
  } = useAuthStore();

  // Инициализация при первом использовании
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    // Состояние
    isAuthenticated,
    isLoading,
    chessLevels,
    user,

    // Методы
    login,
    register,
    logout,
    loadChessLevels,
  };
};
