"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoPlayer } from "@/components/video/video-player"
import { VideoCard } from "@/components/video/video-card"
import { useAuthStore } from "@/stores/auth-store"
import type { Video, Purchase } from "@/types"
import { videosAPI, paymentsAPI, usersAPI } from "@/lib/api"
import { formatPrice, formatDuration } from "@/lib/utils"
import { Clock, Lock, ShoppingCart, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuthStore()

  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [streamData, setStreamData] = useState<any>(null)
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const videoId = Number.parseInt(params.id as string)
  const isPaid = video?.access_level === 1 && video.price > 0
  const hasPurchased = userPurchases.some((p) => p.video_id === videoId && p.status === "completed")
  const canWatch = !isPaid || hasPurchased

  useEffect(() => {
    if (videoId) {
      loadVideo()
      loadRelatedVideos()
      if (isAuthenticated) {
        loadUserPurchases()
      }
    }
  }, [videoId, isAuthenticated])

  useEffect(() => {
    if (video && canWatch && isAuthenticated) {
      loadStreamData()
    }
  }, [video, canWatch, isAuthenticated])

  const loadVideo = async () => {
    try {
      const response = await videosAPI.getVideo(videoId)
      setVideo(response.data)
    } catch (error) {
      console.error("Error loading video:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить видео",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRelatedVideos = async () => {
    try {
      const response = await videosAPI.getVideos({ limit: 4 })
      setRelatedVideos(response.data.filter((v) => v.id !== videoId))
    } catch (error) {
      console.error("Error loading related videos:", error)
    }
  }

  const loadUserPurchases = async () => {
    try {
      const response = await usersAPI.getPurchases()
      setUserPurchases(response.data)
    } catch (error) {
      console.error("Error loading purchases:", error)
    }
  }

  const loadStreamData = async () => {
    try {
      const response = await videosAPI.getVideoStream(videoId)
      setStreamData(response.data)
    } catch (error) {
      console.error("Error loading stream data:", error)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setIsPurchasing(true)
    try {
      const response = await paymentsAPI.createPurchase({
        video_id: videoId,
        payment_method: "kaspi_pay",
      })

      // Перенаправляем на страницу оплаты
      window.location.href = response.data.payment_url
    } catch (error: any) {
      toast({
        title: "Ошибка покупки",
        description: error.response?.data?.detail || "Не удалось создать платеж",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="aspect-video bg-muted rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Видео не найдено</h1>
        <Button onClick={() => router.back()}>Назад</Button>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="space-y-4">
            {canWatch && streamData ? (
              <VideoPlayer
                videoUrl={streamData.video_url}
                hlsUrl={streamData.hls_url}
                title={video.title}
                poster={video.thumbnail_url}
              />
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Требуется покупка</h3>
                    <p className="text-sm text-muted-foreground">Купите урок, чтобы получить доступ к видео</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{video.category.name}</Badge>
                  {video.duration && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(video.duration)}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{video.title}</h1>
              </div>

              {isPaid && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{formatPrice(video.price)} ₸</div>
                  {hasPurchased && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Куплено
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {video.description && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{video.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          {isPaid && !hasPurchased && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Купить урок
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{formatPrice(video.price)} ₸</div>
                  <p className="text-sm text-muted-foreground">Единоразовая покупка</p>
                </div>

                <Button className="w-full" onClick={handlePurchase} disabled={isPurchasing}>
                  {isPurchasing ? "Обработка..." : "Купить сейчас"}
                </Button>

                <div className="text-xs text-muted-foreground text-center">Безопасная оплата через Kaspi Pay</div>
              </CardContent>
            </Card>
          )}

          {/* What you'll learn */}
          <Card>
            <CardHeader>
              <CardTitle>Что вы изучите</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Профессиональные техники и стратегии
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Практические примеры из реальных партий
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Пошаговые объяснения ходов
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Советы от мастеров шахмат
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Похожие уроки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedVideos.map((relatedVideo) => (
              <VideoCard key={relatedVideo.id} video={relatedVideo} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
