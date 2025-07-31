import { create } from "zustand";
import { videoService } from "@/services/video";
import type { VideoPreview, VideoDetail, VideoFilters } from "@/types/video";

interface VideoState {
  // Список видео
  videos: VideoPreview[];
  total: number;
  isLoading: boolean;

  // Текущее видео
  currentVideo: VideoDetail | null;
  isVideoLoading: boolean;

  // Фильтры (только для фронтенда)
  filters: VideoFilters;
}

interface VideoActions {
  // Список видео
  loadVideos: () => Promise<void>; // Убираем параметр filters
  setFilters: (filters: VideoFilters) => void;
  clearVideos: () => void;

  // Конкретное видео
  loadVideoById: (id: string) => Promise<void>;
  clearCurrentVideo: () => void;

  // Утилиты
  setLoading: (loading: boolean) => void;
  setVideoLoading: (loading: boolean) => void;
}

export const useVideoStore = create<VideoState & VideoActions>((set, get) => ({
  // Начальное состояние
  videos: [],
  total: 0,
  isLoading: false,
  currentVideo: null,
  isVideoLoading: false,
  filters: {},

  // Загрузка всех видео без фильтров
  loadVideos: async () => {
    try {
      set({ isLoading: true });

      // Загружаем все видео без фильтров
      const response = await videoService.getVideos();

      set({
        videos: response.data,
        total: response.total,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load videos:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Установка фильтров (только для фронтенда)
  setFilters: (filters: VideoFilters) => {
    set({ filters });
  },

  // Очистка списка видео
  clearVideos: () => {
    set({ videos: [], total: 0, filters: {} });
  },

  // Загрузка конкретного видео
  loadVideoById: async (id: string) => {
    try {
      set({ isVideoLoading: true });

      const video = await videoService.getVideoById(id);

      set({
        currentVideo: video,
        isVideoLoading: false,
      });
    } catch (error) {
      console.error("Failed to load video:", error);
      set({ isVideoLoading: false });
      throw error;
    }
  },

  // Очистка текущего видео
  clearCurrentVideo: () => {
    set({ currentVideo: null });
  },

  // Утилиты
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setVideoLoading: (loading: boolean) => set({ isVideoLoading: loading }),
}));
