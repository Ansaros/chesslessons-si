
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
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
  hlsSegments?: Record<string, string>; // Optional: pre-signed segment URLs
}

export function HLSPlayer({ hlsUrl, poster, hlsSegments }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка видео...");

  // Cleanup function
  const cleanup = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) {
        console.warn("Error destroying HLS instance:", e);
      }
      hlsRef.current = null;
    }
  };

  // Function to create HLS player
  const createHLSPlayer = (retryCount = 0) => {
    if (!videoRef.current || !hlsUrl) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    retryCountRef.current = retryCount;

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (retryCount === 0) {
      setLoadingMessage("Загрузка видео...");
    } else {
      setLoadingMessage(`Повторная попытка ${retryCount}/3...`);
    }

    console.log(`Loading HLS URL (attempt ${retryCount + 1}):`, hlsUrl);

    cleanup();

    if (!Hls.isSupported()) {
        setError("HLS не поддерживается в этом браузере");
        setIsLoading(false);
        return;
    }

    console.log("Using hls.js for HLS playback");
    
    const getBasePath = (url: string): string => {
        const urlWithoutQuery = url.split('?')[0];
        const lastSlash = urlWithoutQuery.lastIndexOf('/');
        if (lastSlash === -1) return '';
        return urlWithoutQuery.substring(0, lastSlash + 1);
    };
    const masterManifestBasePath = getBasePath(hlsUrl);

    // Custom loader must be defined here to have access to Hls scope
    class PresignedUrlLoader extends Hls.DefaultConfig.loader {
        constructor(config: any) {
            super(config);
        }

        load(context: any, config: any, callbacks: any) {
            const originalUrl = context.url;
            // Key based on filename only
            const filenameKey = originalUrl.substring(originalUrl.lastIndexOf('/') + 1).split('?')[0];
            
            // Key based on relative path from master manifest
            let relativePathKey = originalUrl.split('?')[0];
            if (relativePathKey.startsWith(masterManifestBasePath)) {
                relativePathKey = relativePathKey.substring(masterManifestBasePath.length);
            }

            if (hlsSegments && hlsSegments[relativePathKey]) {
                context.url = hlsSegments[relativePathKey];
                console.log(`[PresignedUrlLoader] Using pre-signed URL for relative path key: ${relativePathKey}`);
            } else if (hlsSegments && hlsSegments[filenameKey]) {
                context.url = hlsSegments[filenameKey];
                console.log(`[PresignedUrlLoader] Using pre-signed URL for filename key: ${filenameKey}`);
            }
            else {
                console.warn(`[PresignedUrlLoader] No pre-signed URL found for: ${originalUrl}. Tried keys: '${relativePathKey}', '${filenameKey}'. Using original URL.`);
            }
            
            super.load(context, config, callbacks);
        }
    }


    const hls = new Hls({
        debug: retryCount > 0,
        enableWorker: true,
        lowLatencyMode: false,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 1,
        manifestLoadingRetryDelay: 2000,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 1,
        levelLoadingRetryDelay: 2000,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 2,
        fragLoadingRetryDelay: 1000,
        loader: PresignedUrlLoader, // Use our custom loader for all requests
        xhrSetup: (xhr, url) => {
        console.log('HLS.js XHR setup for URL:', url);
        xhr.setRequestHeader('Accept', '*/*');
        const originalOnError = xhr.onerror;
        xhr.onerror = function(e) {
            console.error('XHR Error for URL:', url, e);
            if (originalOnError) originalOnError.call(this, e);
        };
        const originalOnTimeout = xhr.ontimeout;
        xhr.ontimeout = function(e) {
            console.error('XHR Timeout for URL:', url, e);
            if (originalOnTimeout) originalOnTimeout.call(this, e);
        };
        },
    });

    hlsRef.current = hls;

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log(`HLS manifest parsed successfully (attempt ${retryCount + 1})`, {
        levels: data.levels.length,
        firstLevel: data.levels[0]
        });
        setIsLoading(false);
        retryCountRef.current = 0;
        if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
        }
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`HLS error (attempt ${retryCount + 1}):`, {
        type: data.type,
        details: data.details,
        fatal: data.fatal,
        url: data.url,
        response: data.response
        });

        if (data.fatal) {
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }

        switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
            console.log("Network error detected");
            if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                setError("Не удалось загрузить манифест видео. Возможно, истек срок действия ссылки или проблема с CORS.");
            } else if (retryCount < 3) {
                console.log(`Retrying network error in ${3000}ms...`);
                setTimeout(() => createHLSPlayer(retryCount + 1), 3000);
                return;
            } else {
                setError("Не удалось загрузить видео из-за проблем с сетью");
            }
            break;
            
            case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("Media error, attempting recovery...");
            try {
                hls.recoverMediaError();
                return;
            } catch (e) {
                console.error("Failed to recover from media error:", e);
                if (retryCount < 3) {
                setTimeout(() => createHLSPlayer(retryCount + 1), 2000);
                return;
                }
                setError("Ошибка воспроизведения медиа");
            }
            break;
            
            default:
            setError(`Ошибка HLS плеера: ${data.details || 'Неизвестная ошибка'}`);
        }
        setIsLoading(false);
        } else {
        console.warn("Non-fatal HLS error:", data);
        }
    });

    hls.loadSource(hlsUrl);
    hls.attachMedia(video);

    loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
        console.error("HLS loading timeout reached");
        if (retryCount < 3) {
            createHLSPlayer(retryCount + 1);
        } else {
            setError("Превышено время ожидания загрузки видео. Проверьте подключение к интернету.");
            setIsLoading(false);
        }
        }
    }, 30000);
  };

  useEffect(() => {
    if (hlsUrl) {
      createHLSPlayer(0);
    }
    return cleanup;
  }, [hlsUrl, hlsSegments]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", video.duration);
      setDuration(video.duration);
      if (!hlsRef.current) {
        setIsLoading(false);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => {
      console.log("Video waiting for data...");
      if(video.readyState < 3) {
        setIsLoading(true);
      }
    };
    const handleCanPlay = () => {
      console.log("Video can play");
      setIsLoading(false);
    };
    const handleError = (e: any) => {
      console.error("Video element error:", e, video.error);
      const errorMessage = video.error ? 
        `Ошибка воспроизведения: ${video.error.message} (код: ${video.error.code})` :
        "Ошибка воспроизведения видео";
      setError(errorMessage);
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
        videoRef.current.play().catch((err) => {
          console.error("Play failed:", err);
          setError("Не удалось воспроизвести видео");
        });
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
    const playerContainer = videoRef.current?.parentElement?.parentElement;
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };
  
  const handleRetry = () => {
    setError(null);
    createHLSPlayer(0);
  };

  if (error) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Ошибка загрузки</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
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
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-slate-400">
              Техническая информация
            </summary>
            <div className="text-xs text-slate-400 mt-2 break-all">
              <p>URL: {hlsUrl}</p>
              <p>Попыток: {retryCountRef.current + 1}</p>
            </div>
          </details>
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
          controls={false}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          playsInline
          preload="metadata"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
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

        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
            <div></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="w-20 h-20 rounded-full bg-black/40 hover:bg-black/60 text-white border-2 border-white/20"
                    onClick={togglePlay}
                    disabled={isLoading}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-10 h-10" />
                    ) : (
                        <Play className="w-10 h-10 ml-1" />
                    )}
                </Button>
            </div>

          <div className="p-4 space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              disabled={isLoading}
              aria-label="Video progress"
              className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-amber-500"
            />
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="hover:bg-white/20"
                  aria-label={isPlaying ? "Pause" : "Play"}
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
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
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
                      aria-label="Volume"
                      className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                    />
                  </div>
                </div>

                <span className="text-sm font-medium tabular-nums bg-black/40 px-2 py-1 rounded">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="hover:bg-white/20"
                  aria-label="Fullscreen"
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
