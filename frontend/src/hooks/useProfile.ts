"use client";

import { useProfileStore } from "@/stores/profileStore";
import { useEffect } from "react";

export const useProfile = () => {
  const {
    profile,
    chessLevels,
    isLoading,
    isUpdating,
    loadProfile,
    loadChessLevels,
    updateProfile,
    updatePassword,
  } = useProfileStore();

  // Загружаем данные при первом использовании
  useEffect(() => {
    loadProfile();
    loadChessLevels();
  }, [loadProfile, loadChessLevels]);

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
