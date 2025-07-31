"use client";

import { useVideoStore } from "@/stores/videoStore";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const useVideo = (videoId: string) => {
  const { isAuthenticated } = useAuth();
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
    if (!currentVideo) return false;

    // Бесплатные видео доступны всем
    if (currentVideo.access_level === 0) return true;

    // Для платных и подписочных видео нужна авторизация
    if (!isAuthenticated) return false;

    // TODO: Добавить проверку покупки/подписки
    // Пока считаем, что авторизованный пользователь имеет доступ
    return true;
  };

  return {
    // Состояние
    video: currentVideo,
    isLoading: isVideoLoading,
    canWatch: canWatch(),

    // Методы
    refreshVideo: () => loadVideoById(videoId),
  };
};
