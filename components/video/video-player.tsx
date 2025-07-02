"use client"

import { useEffect, useRef, useState } from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import "@videojs/themes/dist/sea-green/index.css"

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
}

export default function VideoPlayer({ src, poster, title, onTimeUpdate, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Инициализируем Video.js только на клиенте
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js")
      videoElement.classList.add("vjs-big-play-centered")
      videoRef.current.appendChild(videoElement)

      const player = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        poster: poster,
        sources: [
          {
            src: src,
            type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4",
          },
        ],
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true,
          },
        },
      })

      // Обработчики событий
      player.ready(() => {
        setIsReady(true)
        console.log("Player is ready")
      })

      player.on("timeupdate", () => {
        if (onTimeUpdate) {
          onTimeUpdate(player.currentTime())
        }
      })

      player.on("ended", () => {
        if (onEnded) {
          onEnded()
        }
      })

      // Защита от скачивания
      player.on("contextmenu", (e: Event) => {
        e.preventDefault()
        return false
      })

      playerRef.current = player
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src, poster, onTimeUpdate, onEnded])

  // Обновляем источник при изменении
  useEffect(() => {
    if (playerRef.current && isReady) {
      playerRef.current.src({
        src: src,
        type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4",
      })
    }
  }, [src, isReady])

  return (
    <div className="w-full">
      <div
        ref={videoRef}
        className="protected-video"
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: "none" }}
      />

      {/* Защитный слой */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "transparent",
          zIndex: 1,
        }}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  )
}
