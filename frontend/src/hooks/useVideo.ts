"use client";

import { useVideoStore } from "@/stores/videoStore";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";

export const useVideo = (videoId: string) => {
  const { isAuthenticated } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { currentVideo, isVideoLoading, loadVideoById, clearCurrentVideo } =
    useVideoStore();

  // Загружаем видео при изменении ID
  useEffect(() => {
    if (videoId) {
      loadVideoById(videoId);
    }

    return () => {
      clearCurrentVideo();
    };
  }, [videoId, loadVideoById, clearCurrentVideo]);

  // Проверяем, может ли пользователь смотреть видео
  const canWatch = () => {
    // Не можем принять решение, пока грузится профиль, если пользователь авторизован
    if (isAuthenticated && isProfileLoading) {
      return false;
    }
    // Не можем принять решение, пока не загрузится видео
    if (!currentVideo) {
      return false;
    }

    // Админ может смотреть всё
    if (profile?.email === "admin@chess.com") {
      return true;
    }

    // Бесплатные видео доступны всем
    if (currentVideo.access_level === 0) {
      return true;
    }

    // Для платных и подписочных видео нужна авторизация, но без покупки/подписки доступа нет.
    // Логика на странице видео покажет опции для покупки/подписки.
    return false;
  };

  return {
    // Состояние
    video: currentVideo,
    isLoading: isVideoLoading || (isAuthenticated && isProfileLoading),
    canWatch: canWatch(),

    // Методы
    refreshVideo: () => loadVideoById(videoId),
  };
};
