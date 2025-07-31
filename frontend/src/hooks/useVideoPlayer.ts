"use client";

import { useState, useRef, useCallback } from "react";
import type { VideoPlayerState } from "@/types/video";

export const useVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
    isFullscreen: false,
    isLoading: true,
  });

  // Воспроизведение/пауза
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [playerState.isPlaying]);

  // Перемотка
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Изменение громкости
  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      setPlayerState((prev) => ({
        ...prev,
        volume,
        isMuted: volume === 0,
      }));
    }
  }, []);

  // Переключение звука
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !playerState.isMuted;
      videoRef.current.muted = newMuted;
      setPlayerState((prev) => ({ ...prev, isMuted: newMuted }));
    }
  }, [playerState.isMuted]);

  // Полноэкранный режим
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setPlayerState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setPlayerState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Обработчики событий видео
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setPlayerState((prev) => ({
        ...prev,
        currentTime: videoRef.current!.currentTime,
      }));
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setPlayerState((prev) => ({
        ...prev,
        duration: videoRef.current!.duration,
        isLoading: false,
      }));
    }
  }, []);

  const handlePlay = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleLoadStart = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isLoading: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  return {
    // Ref для видео элемента
    videoRef,

    // Состояние плеера
    ...playerState,

    // Методы управления
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,

    // Обработчики событий
    handleTimeUpdate,
    handleLoadedMetadata,
    handlePlay,
    handlePause,
    handleLoadStart,
    handleCanPlay,
  };
};
