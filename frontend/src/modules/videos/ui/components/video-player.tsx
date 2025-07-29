"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, Lock, RefreshCw } from "lucide-react"

// Updated type to include the preview URL from the API response
interface StreamResponse {
    streamUrl: string;
    expiresAt: number;
    previewUrl: string;
    videoInfo: {
        title: string;
        duration?: number;
    };
}

interface VideoPlayerProps {
    videoId: string
    isPurchased: boolean
    onPurchaseClick: () => void
    title: string
    price?: number
}

export const VideoPlayer = ({ videoId, isPurchased, onPurchaseClick, title, price }: VideoPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(100)
    const [isMuted, setIsMuted] = useState(false)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null) // State for the preview image
    const [urlExpiresAt, setUrlExpiresAt] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)

    const fetchSignedUrl = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("userToken") || "demo-token"
            const response = await fetch(`/api/video/${videoId}/stream`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token || "",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                if (response.status === 403 && errorData.needsPurchase) {
                    throw new Error("Требуется покупка видео")
                }
                throw new Error(errorData.error || "Ошибка загрузки видео")
            }

            const data: StreamResponse = await response.json()

            setVideoUrl(data.streamUrl)
            setPreviewUrl(data.previewUrl) 
            setUrlExpiresAt(data.expiresAt)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Не удалось загрузить видео"
            setError(errorMessage)
            console.error("Video fetch error:", err)
        } finally {
            setIsLoading(false)
        }
    }, [videoId])

    useEffect(() => {
        if (isPurchased) {
            fetchSignedUrl()
        }
    }, [isPurchased, fetchSignedUrl])

    useEffect(() => {
        if (!urlExpiresAt || !isPurchased || urlExpiresAt === 0) return // Don't check public URLs

        const checkExpiration = () => {
            const timeUntilExpiry = urlExpiresAt - Date.now()
            if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                console.log("URL скоро истечет, обновляем...")
                fetchSignedUrl()
            }
        }

        const interval = setInterval(checkExpiration, 60000)
        return () => clearInterval(interval)
    }, [fetchSignedUrl, urlExpiresAt, isPurchased])

    const togglePlay = () => {
        if (!isPurchased) {
            onPurchaseClick()
            return
        }
        if (!videoUrl) {
            fetchSignedUrl()
            return
        }
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
        if (videoRef.current) {
            videoRef.current.volume = newVolume / 100
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault()
        }
        if (e.key === " ") {
            e.preventDefault()
            togglePlay()
        }
    }

    const handleVideoError = () => {
        setError("Ошибка воспроизведения видео")
        console.error("Video playback error")
    }

    if (!isPurchased) {
        return (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Lock className="w-20 h-20 mx-auto mb-6 opacity-50" />
                        <h3 className="text-2xl font-semibold mb-3">Контент заблокирован</h3>
                        <p className="text-slate-300 mb-6 max-w-md">Приобретите доступ к видео &quot;{title}&quot;</p>
                        <Button onClick={onPurchaseClick} className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-3">
                            {price ? `Купить за ${price.toLocaleString()} ₸` : "Получить доступ"}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Загрузка видео...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-white text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button
                        onClick={fetchSignedUrl}
                        variant="outline"
                        className="text-white border-white hover:bg-white hover:text-black bg-transparent"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Попробовать снова
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            className="relative bg-black rounded-lg overflow-hidden aspect-video group"
            onContextMenu={handleContextMenu}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {videoUrl && (
                <video
                    ref={videoRef}
                    key={videoUrl} // Key helps React re-mount the component when the URL changes
                    className="w-full h-full object-cover"
                    poster={previewUrl || undefined} // Use the preview URL as the poster
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={handleVideoError}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    crossOrigin="anonymous"
                    preload="metadata"
                >
                    <source src={videoUrl} type="video/mp4" />
                    Ваш браузер не поддерживает воспроизведение видео.
                </video>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-20 h-20 rounded-full bg-black/40 hover:bg-black/60 text-white border-2 border-white/20"
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-4">
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={1}
                            onValueChange={handleSeek}
                            className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&>span:first-child_span]:bg-amber-500"
                        />
                    </div>

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            <Button size="icon" variant="ghost" onClick={togglePlay} className="hover:bg-white/20">
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </Button>
                            <div className="flex items-center space-x-2">
                                <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)} className="hover:bg-white/20">
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </Button>
                                <div className="w-20">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={100}
                                        step={1}
                                        onValueChange={handleVolumeChange}
                                        className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&>span:first-child_span]:bg-white"
                                    />
                                </div>
                            </div>
                            <span className="text-sm bg-black/40 px-2 py-1 rounded">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {urlExpiresAt && urlExpiresAt !== 0 && (
                                <span className="text-xs bg-black/40 px-2 py-1 rounded">
                                    URL до: {new Date(urlExpiresAt).toLocaleTimeString()}
                                </span>
                            )}
                            <Button size="icon" variant="ghost" className="hover:bg-white/20">
                                <Maximize className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}