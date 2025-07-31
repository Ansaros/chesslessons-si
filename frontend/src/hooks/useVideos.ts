"use client";

import { useVideoStore } from "@/stores/videoStore";
import { useEffect, useMemo } from "react";
import type { VideoFilters } from "@/types/video";

export const useVideos = (initialFilters?: VideoFilters) => {
  const {
    videos: allVideos,
    total: totalVideos,
    isLoading,
    filters,
    loadVideos,
    setFilters,
    clearVideos,
  } = useVideoStore();

  // Загружаем все видео при первом использовании
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    } else if (allVideos.length === 0) {
      loadVideos(); // Загружаем без фильтров с бэкенда
    }
  }, [initialFilters, allVideos.length, loadVideos, setFilters]);

  // Применяем фильтры на фронтенде
  const filteredVideos = useMemo(() => {
    let filtered = [...allVideos];

    // Поиск по названию
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm)
      );
    }

    // Фильтр по уровню доступа
    if (filters.access_level !== undefined && filters.access_level !== null) {
      filtered = filtered.filter(
        (video) => video.access_level === filters.access_level
      );
    }

    // Фильтр по атрибутам (уровень игры)
    if (filters.attribute_value_ids && filters.attribute_value_ids.length > 0) {
      filtered = filtered.filter((video) =>
        video.attributes.some((attr) =>
          filters.attribute_value_ids!.includes(attr.value)
        )
      );
    }

    return filtered;
  }, [allVideos, filters]);

  return {
    // Состояние
    videos: filteredVideos,
    total: filteredVideos.length,
    isLoading,
    filters,

    // Методы
    setFilters,
    refreshVideos: () => loadVideos(), // Перезагружаем все видео
    clearVideos,
  };
};
