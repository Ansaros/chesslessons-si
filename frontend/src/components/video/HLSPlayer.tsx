"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatDuration } from "@/utils/videoHelpers";

interface HLSPlayerProps {
  hlsUrl: string;
  poster?: string;
}

export function HLSPlayer({ hlsUrl, poster }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка видео...");

  // Функция для создания HLS плеера
  const createHLSPlayer = async (retryCount = 0) => {
    if (!videoRef.current || !hlsUrl) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    retryCountRef.current = retryCount;

    // Обновляем сообщение о загрузке
    if (retryCount === 0) {
      setLoadingMessage("Загрузка видео...");
    } else {
      setLoadingMessage(`Повторная попытка ${retryCount}/5...`);
    }

    console.log(`Loading HLS URL (attempt ${retryCount + 1}):`, hlsUrl);

    // Очищаем предыдущий HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Проверяем нативную поддержку HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS support");
      video.src = hlsUrl;

      const handleLoadedMetadata = () => {
        console.log("Native HLS: metadata loaded");
        setIsLoading(false);
        setDuration(video.duration);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
      };

      const handleError = (e: any) => {
        console.error("Native HLS error:", e);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);

        if (retryCount < 5) {
          setTimeout(
            () => createHLSPlayer(retryCount + 1),
            2000 * (retryCount + 1)
          );
        } else {
          setError("Не удалось загрузить видео после нескольких попыток");
          setIsLoading(false);
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);

      // Таймаут для нативного HLS
      setTimeout(() => {
        if (isLoading && retryCount < 5) {
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
          video.removeEventListener("error", handleError);
          createHLSPlayer(retryCount + 1);
        }
      }, 30000 + retryCount * 10000); // Увеличиваем таймаут с каждой попыткой
    } else {
      // Для других браузеров используем hls.js
      try {
        const { default: Hls } = await import("hls.js");

        if (Hls.isSupported()) {
          // Извлекаем параметры подписи AWS из исходного URL
          const extractAWSSignature = (url: string) => {
            try {
              const urlObj = new URL(url);
              const params = urlObj.searchParams;

              const signature: Record<string, string> = {};

              // Извлекаем все AWS параметры
              const awsParams = [
                "X-Amz-Algorithm",
                "X-Amz-Credential",
                "X-Amz-Date",
                "X-Amz-Expires",
                "X-Amz-SignedHeaders",
                "X-Amz-Signature",
              ];

              awsParams.forEach((param) => {
                const value = params.get(param);
                if (value) {
                  signature[param] = value;
                }
              });

              return signature;
            } catch (error) {
              console.error("Failed to extract AWS signature:", error);
              return {};
            }
          };

          const awsSignature = extractAWSSignature(hlsUrl);
          console.log("Extracted AWS signature:", awsSignature);

          // Прогрессивные таймауты - увеличиваем с каждой попыткой
          const baseTimeout = 30000 + retryCount * 15000; // 30s, 45s, 60s, 75s, 90s
          const maxRetries = Math.max(3, 6 - retryCount); // Уменьшаем количество retry с каждой попыткой

          const hls = new Hls({
            debug: retryCount > 2, // Включаем debug после 3 попыток
            enableWorker: true,
            lowLatencyMode: false,
            // Прогрессивные таймауты
            manifestLoadingTimeOut: baseTimeout,
            manifestLoadingMaxRetry: maxRetries,
            manifestLoadingRetryDelay: 2000 + retryCount * 1000,
            levelLoadingTimeOut: baseTimeout,
            levelLoadingMaxRetry: maxRetries,
            levelLoadingRetryDelay: 2000 + retryCount * 1000,
            fragLoadingTimeOut: baseTimeout + 10000,
            fragLoadingMaxRetry: maxRetries,
            fragLoadingRetryDelay: 1500 + retryCount * 500,
            xhrSetup: (xhr, url) => {
              console.log(
                `XHR Setup for URL (attempt ${retryCount + 1}):`,
                url
              );

              // Создаем новый XMLHttpRequest чтобы полностью обойти axios
              const cleanXhr = new XMLHttpRequest();

              // Копируем основные свойства
              Object.defineProperty(xhr, "readyState", {
                get: () => cleanXhr.readyState,
              });
              Object.defineProperty(xhr, "response", {
                get: () => cleanXhr.response,
              });
              Object.defineProperty(xhr, "responseText", {
                get: () => cleanXhr.responseText,
              });
              Object.defineProperty(xhr, "status", {
                get: () => cleanXhr.status,
              });
              Object.defineProperty(xhr, "statusText", {
                get: () => cleanXhr.statusText,
              });

              // Копируем методы
              xhr.open = cleanXhr.open.bind(cleanXhr);
              xhr.send = cleanXhr.send.bind(cleanXhr);
              xhr.abort = cleanXhr.abort.bind(cleanXhr);
              xhr.setRequestHeader = cleanXhr.setRequestHeader.bind(cleanXhr);
              xhr.getResponseHeader = cleanXhr.getResponseHeader.bind(cleanXhr);
              xhr.getAllResponseHeaders =
                cleanXhr.getAllResponseHeaders.bind(cleanXhr);

              // Копируем обработчики событий
              cleanXhr.onreadystatechange = xhr.onreadystatechange;
              cleanXhr.onload = xhr.onload;
              cleanXhr.onerror = xhr.onerror;
              cleanXhr.onprogress = xhr.onprogress;
              cleanXhr.onabort = xhr.onabort;
              cleanXhr.ontimeout = xhr.ontimeout;

              // Если это .ts сегмент, добавляем подпись AWS
              if (url.includes(".ts") && Object.keys(awsSignature).length > 0) {
                const urlObj = new URL(url);

                // Добавляем параметры подписи
                Object.entries(awsSignature).forEach(([key, value]) => {
                  urlObj.searchParams.set(key, value);
                });

                const signedUrl = urlObj.toString();
                console.log("Signing .ts URL:", url, "→", signedUrl);

                // Открываем запрос с подписанным URL
                cleanXhr.open("GET", signedUrl, true);
                return; // Важно! Возвращаемся, чтобы не выполнился стандартный open()
              }

              console.log("Using clean XHR for:", url);
            },
          });

          hlsRef.current = hls;

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log(
              `HLS manifest parsed successfully (attempt ${retryCount + 1})`
            );
            setIsLoading(false);
            retryCountRef.current = 0; // Сбрасываем счетчик при успехе
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS error (attempt ${retryCount + 1}):`, data);

            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                console.log("Network error, checking if should retry...");

                if (retryCount < 5) {
                  console.log(`Retrying in ${2000 * (retryCount + 1)}ms...`);
                  setTimeout(() => {
                    createHLSPlayer(retryCount + 1);
                  }, 2000 * (retryCount + 1));
                  return;
                }

                setError(
                  "Не удалось загрузить видео из-за проблем с сетью. Проверьте подключение к интернету."
                );
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                console.log("Media error, attempting recovery...");
                try {
                  hls.recoverMediaError();
                  return;
                } catch (e) {
                  console.error("Failed to recover from media error:", e);
                }
              } else {
                setError(`Ошибка HLS: ${data.type}`);
              }
              setIsLoading(false);
            } else {
              // Не фатальные ошибки - просто логируем
              console.warn("Non-fatal HLS error:", data);
            }
          });

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log(`HLS media attached (attempt ${retryCount + 1})`);
          });
        } else {
          console.error("HLS is not supported");
          setError("HLS не поддерживается в этом браузере");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load hls.js:", error);
        setError("Не удалось загрузить HLS плеер");
        setIsLoading(false);
      }
    }
  };

  // Инициализация HLS
  useEffect(() => {
    createHLSPlayer(0);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl]);

  // Обработчики событий видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError("Ошибка воспроизведения видео.");
      setIsLoading(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume / 100;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleRetry = () => {
    createHLSPlayer(0);
  };

  if (error) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Ошибка загрузки</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{error}</p>
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={poster}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          crossOrigin="anonymous"
          playsInline
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
              <p className="mb-2">{loadingMessage}</p>
              {retryCountRef.current > 0 && (
                <p className="text-sm text-slate-300">
                  Медленное соединение. Пожалуйста, подождите...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="w-20 h-20 rounded-full bg-black/40 hover:bg-black/60 text-white border-2 border-white/20"
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                disabled={isLoading}
                className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-amber-500"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleMute}
                    className="hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                    />
                  </div>
                </div>

                <span className="text-sm font-medium bg-black/40 px-2 py-1 rounded">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
