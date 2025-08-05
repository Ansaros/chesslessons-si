
"use client";

import { useProfileStore } from "@/stores/profileStore";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const useProfile = () => {
  const {
    profile,
    isLoading,
    isUpdating,
    loadProfile,
    updateProfile,
    updatePassword,
    clearProfile,
  } = useProfileStore();
  const { isAuthenticated, chessLevels } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      clearProfile();
    }
  }, [isAuthenticated, loadProfile, clearProfile]);

  // Находим название текущего уровня
  const currentChessLevel = chessLevels.find(
    (level) => level.id === profile?.chess_level_id
  );

  return {
    // Состояние
    profile,
    chessLevels,
    currentChessLevel,
    isLoading,
    isUpdating,

    // Методы
    updateProfile,
    updatePassword,
    refreshProfile: loadProfile,
  };
};
