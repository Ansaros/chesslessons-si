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
} from "lucide-react";
import { formatDuration } from "@/utils/videoHelpers";

interface HLSPlayerProps {
  hlsUrl: string;
  poster?: string;
}

export function HLSPlayer({ hlsUrl, poster }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация HLS
  useEffect(() => {
    if (!videoRef.current || !hlsUrl) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);

    console.log("Loading HLS URL:", hlsUrl);

    // Очищаем предыдущий HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Проверяем нативную поддержку HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS support");
      video.src = hlsUrl;

      video.addEventListener("loadedmetadata", () => {
        console.log("Native HLS: metadata loaded");
        setIsLoading(false);
        setDuration(video.duration);
      });

      video.addEventListener("error", (e) => {
        console.error("Native HLS error:", e);
        setError(
          "Ошибка загрузки видео. Возможно, проблема с CORS настройками сервера."
        );
        setIsLoading(false);
      });
    } else {
      // Для других браузеров используем hls.js
      import("hls.js")
        .then(({ default: Hls }) => {
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

            const hls = new Hls({
              debug: false,
              enableWorker: true,
              lowLatencyMode: false,
              xhrSetup: (xhr, url) => {
                // Если сегмент .ts — подписываем
                if (
                  url.includes(".ts") &&
                  Object.keys(awsSignature).length > 0
                ) {
                  const originalUrl = new URL(url);

                  // Добавим подпись
                  Object.entries(awsSignature).forEach(([key, value]) => {
                    originalUrl.searchParams.set(key, value);
                  });

                  const signedUrl = originalUrl.toString();
                  console.log("🔒 Подписанный .ts сегмент:", signedUrl);

                  // Хак: переопределяем open/send чтобы изменить URL перед отправкой
                  const originalOpen = xhr.open.bind(xhr);

                  xhr.open = function (...args: any[]) {
                    args[1] = signedUrl; // Заменяем URL
                    return originalOpen(...args);
                  };
                }
              },
            });

            hlsRef.current = hls;

            hls.loadSource(hlsUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed successfully");
              setIsLoading(false);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error("HLS error:", data);
              if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  setError(
                    "Ошибка сети. Проблема с CORS настройками сервера. Обратитесь к администратору."
                  );
                } else {
                  setError(`Ошибка HLS: ${data.type}`);
                }
                setIsLoading(false);
              }
            });

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              console.log("HLS media attached");
            });
          } else {
            console.error("HLS is not supported");
            setError("HLS не поддерживается в этом браузере");
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("Failed to load hls.js:", error);
          setError("Не удалось загрузить HLS плеер");
          setIsLoading(false);
        });
    }

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
      setError(
        "Ошибка воспроизведения видео. Возможно, проблема с CORS настройками."
      );
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

  if (error) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Ошибка загрузки</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{error}</p>
          <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg text-yellow-200 text-xs">
            <strong>Решение:</strong> Администратору нужно настроить CORS для
            DigitalOcean Spaces, разрешив запросы с домена localhost:3000 и
            продакшн домена.
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
              <p>Загрузка видео...</p>
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
