"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, AlertCircle } from "lucide-react"

interface VideoPlayerProps {
  videoUrl?: string
  hlsUrl?: string
  title: string
  poster?: string
}

export function VideoPlayer({ videoUrl, hlsUrl, title, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setError("Ошибка загрузки видео")
      setIsLoading(false)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    // Если есть HLS URL, используем его для лучшего качества стриминга
    if (hlsUrl && window.Hls?.isSupported()) {
      const hls = new window.Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)

      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          setError("Ошибка воспроизведения видео")
          setIsLoading(false)
        }
      })

      return () => {
        hls.destroy()
        video.removeEventListener("loadstart", handleLoadStart)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("error", handleError)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    } else if (videoUrl) {
      video.src = videoUrl
    }

    return () => {
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [hlsUrl, videoUrl])

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} className="w-full h-full" controls poster={poster} preload="metadata" playsInline>
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает воспроизведение видео.
      </video>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex items-center space-x-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка видео...</span>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button size="lg" onClick={handlePlay} className="rounded-full w-16 h-16 p-0">
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
